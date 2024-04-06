/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under both the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree and the Apache
 * License, Version 2.0 found in the LICENSE-APACHE file in the root directory
 * of this source tree.
 */

use std::collections::HashSet;
use std::fmt::Debug;
use std::hash::Hash;
use std::sync::Arc;

use allocative::Allocative;
use async_trait::async_trait;
use buck2_core::cells::cell_path::CellPath;
use buck2_core::cells::cell_path::CellPathRef;
use buck2_core::cells::name::CellName;
use buck2_core::fs::paths::file_name::FileNameBuf;
use buck2_futures::cancellation::CancellationContext;
use cmp_any::PartialEqAny;
use derive_more::Display;
use dice::DiceComputations;
use dice::DiceTransactionUpdater;
use dice::Key;
use dice::LinearRecomputeDiceComputations;
use dupe::Dupe;

use crate::dice::file_ops::delegate::get_delegated_file_ops;
use crate::file_ops::FileOps;
use crate::file_ops::FileOpsError;
use crate::file_ops::RawPathMetadata;
use crate::file_ops::ReadDirOutput;
use crate::legacy_configs::buildfiles::HasBuildfiles;

pub mod delegate;

/// A wrapper around DiceComputations for places that want to interact with a dyn FileOps.
///
/// In general, it's better to use DiceFileComputations directly.
pub struct DiceFileOps<'c, 'd>(pub &'c LinearRecomputeDiceComputations<'d>);

pub struct DiceFileComputations;

/// Functions for accessing files with keys on the dice graph.
impl DiceFileComputations {
    pub async fn read_dir(
        ctx: &mut DiceComputations<'_>,
        path: CellPathRef<'_>,
    ) -> anyhow::Result<ReadDirOutput> {
        ctx.compute(&ReadDirKey(path.to_owned()))
            .await?
            .map_err(anyhow::Error::from)
    }

    async fn read_file_if_exists(
        ctx: &mut DiceComputations<'_>,
        path: CellPathRef<'_>,
    ) -> anyhow::Result<Option<String>> {
        let file_ops = get_delegated_file_ops(ctx, path.cell()).await?;
        let () = ctx.compute(&ReadFileKey(Arc::new(path.to_owned()))).await?;
        // FIXME(JakobDegen): We intentionally avoid storing the result of this function in dice.
        // However, that also means that the `ReadFileKey` is not marked as transient if this
        // returns an error, which is unfortunate.
        file_ops.read_file_if_exists(path.path()).await
    }

    pub async fn read_file(
        ctx: &mut DiceComputations<'_>,
        path: CellPathRef<'_>,
    ) -> anyhow::Result<String> {
        Self::read_file_if_exists(ctx, path)
            .await?
            .ok_or_else(|| FileOpsError::FileNotFound(path.to_string()).into())
    }

    pub async fn read_path_metadata_if_exists(
        ctx: &mut DiceComputations<'_>,
        path: CellPathRef<'_>,
    ) -> anyhow::Result<Option<RawPathMetadata>> {
        ctx.compute(&PathMetadataKey(path.to_owned()))
            .await?
            .map_err(anyhow::Error::from)
    }

    pub async fn read_path_metadata(
        ctx: &mut DiceComputations<'_>,
        path: CellPathRef<'_>,
    ) -> anyhow::Result<RawPathMetadata> {
        Self::read_path_metadata_if_exists(ctx, path)
            .await?
            .ok_or_else(|| FileOpsError::FileNotFound(path.to_string()).into())
    }

    pub async fn is_ignored(
        ctx: &mut DiceComputations<'_>,
        path: CellPathRef<'_>,
    ) -> anyhow::Result<bool> {
        get_delegated_file_ops(ctx, path.cell())
            .await?
            .is_ignored(path.path())
            .await
    }

    pub async fn buildfiles<'a>(
        ctx: &mut DiceComputations<'_>,
        cell: CellName,
    ) -> anyhow::Result<Arc<[FileNameBuf]>> {
        ctx.get_buildfiles(cell).await
    }
}

#[derive(Allocative)]
pub struct FileChangeTracker {
    files_to_dirty: HashSet<ReadFileKey>,
    dirs_to_dirty: HashSet<ReadDirKey>,
    paths_to_dirty: HashSet<PathMetadataKey>,
}

impl FileChangeTracker {
    pub fn new() -> Self {
        Self {
            files_to_dirty: Default::default(),
            dirs_to_dirty: Default::default(),
            paths_to_dirty: Default::default(),
        }
    }

    pub fn write_to_dice(self, ctx: &mut DiceTransactionUpdater) -> anyhow::Result<()> {
        ctx.changed(self.files_to_dirty)?;
        ctx.changed(self.dirs_to_dirty)?;
        ctx.changed(self.paths_to_dirty)?;

        Ok(())
    }

    fn file_contents_modify(&mut self, path: CellPath) {
        self.files_to_dirty
            .insert(ReadFileKey(Arc::new(path.clone())));
        self.paths_to_dirty.insert(PathMetadataKey(path));
    }

    pub fn file_added_or_removed(&mut self, path: CellPath) {
        let parent = path.parent();

        self.file_contents_modify(path.clone());
        if let Some(parent) = parent {
            // The above can be None (validly!) if we have a cell we either create or delete.
            // That never happens in established repos, but if you are setting one up, it's not uncommon.
            // Since we don't include paths in different cells, the fact we don't dirty the parent
            // (which is in an enclosing cell) doesn't matter.
            self.dirs_to_dirty.insert(ReadDirKey(parent.to_owned()));
        }
    }

    pub fn dir_added_or_removed(&mut self, path: CellPath) {
        self.paths_to_dirty.insert(PathMetadataKey(path.clone()));
        if let Some(parent) = path.parent() {
            let parent = parent.to_owned();
            // The above can be None (validly!) if we have a cell we either create or delete.
            // That never happens in established repos, but if you are setting one up, it's not uncommon.
            // Since we don't include paths in different cells, the fact we don't dirty the parent
            // (which is in an enclosing cell) doesn't matter.
            self.dirs_to_dirty
                .extend([ReadDirKey(path), ReadDirKey(parent)]);
        }
    }

    pub fn file_changed(&mut self, path: CellPath) {
        self.file_contents_modify(path)
    }

    pub fn file_removed(&mut self, path: CellPath) {
        self.file_added_or_removed(path)
    }

    pub fn file_added(&mut self, path: CellPath) {
        self.file_added_or_removed(path)
    }

    pub fn dir_changed(&mut self, path: CellPath) {
        self.paths_to_dirty.insert(PathMetadataKey(path.clone()));
        self.dirs_to_dirty.insert(ReadDirKey(path));
    }

    pub fn dir_added(&mut self, path: CellPath) {
        self.dir_added_or_removed(path)
    }

    pub fn dir_removed(&mut self, path: CellPath) {
        self.dir_added_or_removed(path)
    }
}

#[derive(Clone, Dupe, Display, Debug, Eq, Hash, PartialEq, Allocative)]
struct ReadFileKey(Arc<CellPath>);

#[async_trait]
impl Key for ReadFileKey {
    type Value = ();
    async fn compute(
        &self,
        _ctx: &mut DiceComputations,
        _cancellations: &CancellationContext,
    ) -> Self::Value {
    }

    fn equality(_: &Self::Value, _: &Self::Value) -> bool {
        false
    }
}

#[derive(Clone, Display, Debug, Eq, Hash, PartialEq, Allocative)]
struct ReadDirKey(CellPath);

#[async_trait]
impl Key for ReadDirKey {
    type Value = buck2_error::Result<ReadDirOutput>;
    async fn compute(
        &self,
        ctx: &mut DiceComputations,
        _cancellations: &CancellationContext,
    ) -> Self::Value {
        get_delegated_file_ops(ctx, self.0.cell())
            .await?
            .read_dir(self.0.as_ref().path())
            .await
            .map_err(buck2_error::Error::from)
    }

    fn equality(x: &Self::Value, y: &Self::Value) -> bool {
        match (x, y) {
            (Ok(x), Ok(y)) => x == y,
            _ => false,
        }
    }

    fn validity(x: &Self::Value) -> bool {
        x.is_ok()
    }
}

#[derive(Clone, Display, Debug, Eq, Hash, PartialEq, Allocative)]
struct PathMetadataKey(CellPath);

#[async_trait]
impl Key for PathMetadataKey {
    type Value = buck2_error::Result<Option<RawPathMetadata>>;
    async fn compute(
        &self,
        ctx: &mut DiceComputations,
        _cancellations: &CancellationContext,
    ) -> Self::Value {
        let res = get_delegated_file_ops(ctx, self.0.cell())
            .await?
            .read_path_metadata_if_exists(self.0.as_ref().path())
            .await?;

        match res {
            Some(RawPathMetadata::Symlink {
                at: ref path,
                to: _,
            }) => {
                ctx.compute(&ReadFileKey(path.dupe())).await?;
            }
            _ => (),
        };

        Ok(res)
    }

    fn equality(x: &Self::Value, y: &Self::Value) -> bool {
        match (x, y) {
            (Ok(x), Ok(y)) => x == y,
            _ => false,
        }
    }

    fn validity(x: &Self::Value) -> bool {
        x.is_ok()
    }
}

#[async_trait]
impl FileOps for DiceFileOps<'_, '_> {
    async fn read_file_if_exists(
        &self,
        path: CellPathRef<'async_trait>,
    ) -> anyhow::Result<Option<String>> {
        DiceFileComputations::read_file_if_exists(&mut self.0.get(), path).await
    }

    async fn read_dir(&self, path: CellPathRef<'async_trait>) -> anyhow::Result<ReadDirOutput> {
        DiceFileComputations::read_dir(&mut self.0.get(), path).await
    }

    async fn read_path_metadata_if_exists(
        &self,
        path: CellPathRef<'async_trait>,
    ) -> anyhow::Result<Option<RawPathMetadata>> {
        DiceFileComputations::read_path_metadata_if_exists(&mut self.0.get(), path).await
    }

    async fn is_ignored(&self, path: CellPathRef<'async_trait>) -> anyhow::Result<bool> {
        DiceFileComputations::is_ignored(&mut self.0.get(), path).await
    }

    fn eq_token(&self) -> PartialEqAny {
        // We do not store this on DICE, so we don't care about equality.
        // Also we cannot do `PartialEqAny` here because `Self` is not `'static`.
        PartialEqAny::always_false()
    }

    async fn buildfiles<'a>(&self, cell: CellName) -> anyhow::Result<Arc<[FileNameBuf]>> {
        DiceFileComputations::buildfiles(&mut self.0.get(), cell).await
    }
}
