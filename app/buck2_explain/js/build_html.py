#!/usr/bin/env python3
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under both the MIT license found in the
# LICENSE-MIT file in the root directory of this source tree and the Apache
# License, Version 2.0 found in the LICENSE-APACHE file in the root directory
# of this source tree.

# credits to implementation in https://www.internalfb.com/code/fbsource/fbcode/eden/addons/build-tar.py

import argparse
import atexit
import functools
import glob
import os
import shlex
import shutil
import subprocess
import sys

import tempfile
from typing import List

rm_rf = functools.partial(shutil.rmtree, ignore_errors=True)
print_err = functools.partial(print, file=sys.stderr)
glob_r = functools.partial(glob.glob, recursive=True)


def run(command: List[str], cwd=None, env=None):
    print_err(f"{cwd if cwd else ' '} $ {shlex.join(command)}")

    if env is not None:
        env = {**os.environ, **env}

    # shell=True with a List `command` seems buggy on *nix.
    # It might run ['sh', '-c', 'a', 'b'] instead of ['sh', '-c', 'a b'].
    subprocess.run(command, shell=(os.name == "nt"), check=True, cwd=cwd, env=env)


def realpath_args(args: List[str]) -> List[str]:
    return [os.path.realpath(arg) if os.path.exists(arg) else arg for arg in args]


def copy_writable(src, dst, *, follow_symlinks=True):
    """shutil.copy, but ensure that yarn.lock is writable
    - RE might make src/ read-only with its "restrictive mode".
    - When copying the RE "restrictive" src/, yarn.lock is read-only.
    - yarn wants yarn.lock to be writable, even with --frozen-lockfile.
    """
    shutil.copy(src, dst, follow_symlinks=follow_symlinks)
    if dst.endswith("yarn.lock") and os.name != "nt":
        os.chmod(dst, 0o666)


def main():
    parser = argparse.ArgumentParser(description="Creates a html from explain source.")
    parser.add_argument(
        "-o",
        "--output",
        nargs="?",
        default="explain.html",
        help="Path to the output '.html' file.",
    )
    parser.add_argument(
        "--yarn",
        default="",
        help="Path to yarn executable.",
    )
    parser.add_argument(
        "--yarn-offline-mirror",
        default=None,
        help="Path to the yarn offline mirror.",
    )
    parser.add_argument(
        "--src",
        default=None,
        help="Directory that contains the source code.",
    )
    parser.add_argument(
        "--tmp",
        default=None,
        help="Temporary directory to run build. Do not modify src in-place.",
    )

    args = parser.parse_args()

    # posix=False prevents shlex.split from treating \\ as escape character, breaking Windows.
    yarn = realpath_args(
        shlex.split(args.yarn or os.getenv("YARN") or "yarn", posix=False)
    )

    src = args.src or "."
    out = args.output

    if args.tmp:
        # copy source to a temporary directory
        # used by buck genrule, which does not guarantee src is writable
        tmp_src_path = tempfile.mkdtemp(prefix="explain_src", dir=args.tmp)
        atexit.register(lambda: rm_rf(tmp_src_path))
        print_err(f"copying source {src} to {tmp_src_path}")
        shutil.copytree(
            src, tmp_src_path, dirs_exist_ok=True, copy_function=copy_writable
        )
        src = tmp_src_path

    src_join = functools.partial(os.path.join, src)

    if args.yarn_offline_mirror:
        env = {"YARN_YARN_OFFLINE_MIRROR": os.path.realpath(args.yarn_offline_mirror)}
        run(
            yarn
            + [
                "--cwd",
                src_join(),
                "install",
                "--offline",
                "--frozen-lockfile",
                "--ignore-scripts",
                "--check-files",
            ],
            env=env,
        )
    else:
        run(yarn + ["--cwd", src_join(), "install", "--prefer-offline"])

    rm_rf(src_join("dist"))
    run(yarn + ["--cwd", src_join(), "run", "build"], env={"CI": "false"})

    # inline js into html file
    with open(src_join("dist/app.js"), "r") as f:
        js_content = f.read()
    with open(src_join("index.html"), "r") as f:
        html_content = f.read()
    html_content = html_content.replace(
        '<script src="dist/app.js"></script>', f"<script>{js_content}</script>"
    )
    with open(out, "w") as out_file:
        out_file.write(html_content)


if __name__ == "__main__":
    main()
