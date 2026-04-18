"""하데스 자동 교정 게이트 - 범용 프로젝트 게이트.

- 성공 시 출력 최소화.
- 실패 시 충분히 상세하게 출력.
- `pre-commit`가 설치되어 있지 않으면 오류로 중단.
- 어떤 프로젝트든 공통적으로 사용할 수 있습니다.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def find_hades_root(current_path: Path) -> Path | None:
    """현재 경로에서 하데스 시스템을 찾습니다."""
    for parent in [current_path] + list(current_path.parents):
        if (parent / "정체성.txt").exists():
            return parent
    return None


def get_precommit_config() -> Path:
    """pre-commit 설정 파일 경로를 반환합니다."""
    current_path = Path(__file__).resolve().parent
    hades_root = find_hades_root(current_path)
    if hades_root is None:
        # 하데스 시스템이 없으면 현재 디렉터리에서 찾기
        config_path = current_path / ".pre-commit-config.yaml"
    else:
        config_path = hades_root / "설정" / ".pre-commit-config.yaml"

    if not config_path.exists():
        raise FileNotFoundError(f"pre-commit 설정 파일이 없습니다: {config_path}")
    return config_path


def run_precommit() -> int:
    config_path = get_precommit_config()
    root_dir = config_path.parent

    cmd = [sys.executable, "-m", "pre_commit", "run", "--all-files"]
    result = subprocess.run(cmd, cwd=str(root_dir), capture_output=True, text=True)

    if result.returncode == 0:
        return 0

    print("❌ Linter red light: 자동 수정에 실패했습니다.")
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    return result.returncode


def main() -> int:
    try:
        return run_precommit()
    except FileNotFoundError as e:
        print(f"[ERROR] {e}")
        print("[ERROR] pre-commit 모듈이 설치되어 있지 않습니다. pip install pre-commit를 실행하세요.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())