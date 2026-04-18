"""Install repository git hooks from 하데스/훅스 directory."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def find_hades_root(start_path: Path) -> Path | None:
    """Find the 하데스 root directory by searching for 정체성.txt."""
    current = start_path.resolve()
    while current != current.parent:
        if (current / "정체성.txt").exists():
            return current
        current = current.parent
    return None


def main() -> int:
    # Find 하데스 root
    hades_root = find_hades_root(Path(__file__).resolve().parent)
    if not hades_root:
        print("[ERROR] 하데스 root를 찾을 수 없습니다. (정체성.txt 없음)")
        return 1

    hooks_dir = hades_root / "훅스"
    if not hooks_dir.exists():
        print("[ERROR] 훅스 디렉터리가 없습니다.")
        return 1

    # Find project root (where .git exists)
    project_root = Path.cwd()
    while project_root != project_root.parent:
        if (project_root / ".git").exists():
            break
        project_root = project_root.parent
    else:
        print("[ERROR] Git repository를 찾을 수 없습니다.")
        return 1

    try:
        subprocess.run(["git", "config", "core.hooksPath", str(hooks_dir)], cwd=str(project_root), check=True)
        print("Git hooks path set to 하데스/훅스")
        return 0
    except subprocess.CalledProcessError as exc:
        print(f"[ERROR] git config failed: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())