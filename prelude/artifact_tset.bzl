# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under both the MIT license found in the
# LICENSE-MIT file in the root directory of this source tree and the Apache
# License, Version 2.0 found in the LICENSE-APACHE file in the root directory
# of this source tree.

load("@prelude//utils:expect.bzl", "expect")
load(
    "@prelude//utils:utils.bzl",
    "flatten",
)

# Generic tag to provide more information about the artifact
ArtifactInfoTag = enum(
    # Describes swiftmodule artifact generated by swift rules.
    "swiftmodule",
    # Describes clang pcm module artifact generated and consumed by swift rules.
    "swift_pcm",
)

ArtifactInfo = record(
    label = field(Label),
    identity = field(Label | str),
    artifacts = field(list[Artifact]),
    tags = field(list[ArtifactInfoTag]),
)

def stringify_artifact_label(value: Label | str) -> str:
    if type(value) == "string":
        return value
    return str(value.raw_target())

def _get_artifacts(entries: list[ArtifactInfo]) -> list[Artifact]:
    return flatten([entry.artifacts for entry in entries])

_ArtifactTSet = transitive_set(
    args_projections = {
        "artifacts": _get_artifacts,
    },
)

ArtifactTSet = record(
    _tset = field([_ArtifactTSet, None], None),
)

def make_artifact_tset(
        actions: AnalysisActions,
        # Must be non-`None` if artifacts are passed in to `artifacts`.
        label: Label | None = None,
        identity: Label | str | None = None,
        artifacts: list[Artifact] = [],
        infos: list[ArtifactInfo] = [],
        children: list[ArtifactTSet] = [],
        tags: list[ArtifactInfoTag] = []) -> ArtifactTSet:
    expect(
        label != None or not artifacts,
        "must pass in `label` to associate with artifacts",
    )

    # As a convenience for our callers, filter our `None` children.
    children = [c._tset for c in children if c._tset != None]

    # Build list of all non-child values.
    values = []
    if artifacts:
        artifact_identity = identity if identity else label
        values.append(ArtifactInfo(label = label, identity = artifact_identity, artifacts = artifacts, tags = tags))
    values.extend(infos)

    # If there's no children or artifacts, return `None`.
    if not values and not children:
        return ArtifactTSet()

    # We only build a `_ArtifactTSet` if there's something to package.
    kwargs = {}
    if values:
        kwargs["value"] = values
    if children:
        kwargs["children"] = children
    return ArtifactTSet(
        _tset = actions.tset(_ArtifactTSet, **kwargs),
    )

def project_artifacts(
        actions: AnalysisActions,
        tsets: list[ArtifactTSet] = []) -> list[TransitiveSetArgsProjection]:
    """
    Helper to project a list of optional tsets.
    """

    tset = make_artifact_tset(
        actions = actions,
        children = tsets,
    )

    if tset._tset == None:
        return []

    return [tset._tset.project_as_args("artifacts")]
