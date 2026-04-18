"""하데스 CLI 게이트 - 범용 프로젝트 게이트.

이 스크립트는 모든 주요 실행 전에 정체성.txt를 읽고 확인하도록 강제합니다.
어떤 프로젝트든 공통적으로 사용할 수 있습니다.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def find_hades_root(current_path: Path) -> Path | None:
    """현재 경로에서 하데스 시스템을 찾습니다."""
    for parent in [current_path] + list(current_path.parents):
        if (parent / "정체성.txt").exists():
            return parent
    return None


def get_spec_path() -> Path:
    """정체성.txt 경로를 반환합니다."""
    current_path = Path(__file__).resolve().parent
    hades_root = find_hades_root(current_path)
    if hades_root is None:
        # 하데스 시스템이 없으면 현재 디렉터리에서 찾기
        spec_path = current_path / "정체성.txt"
    else:
        spec_path = hades_root / "정체성.txt"

    if not spec_path.exists():
        raise FileNotFoundError(f"필수 문서가 없습니다: {spec_path}")
    return spec_path


def read_spec() -> str:
    spec_path = get_spec_path()
    return spec_path.read_text(encoding="utf-8")


def print_summary(lines: int = 40) -> None:
    text = read_spec().strip().splitlines()
    print("=== 정체성.txt 요약 ===")
    for line in text[:lines]:
        print(line)
    if len(text) > lines:
        print(f"... (총 {len(text)}줄 중 {lines}줄 출력)")


def confirm_read() -> bool:
    answer = input("정체성.txt를 확인하셨습니까? (yes/no): ").strip().lower()
    return answer in {"yes", "y"}


def run_command(command: list[str]) -> int:
    if not command:
        raise ValueError("실행할 명령을 지정해야 합니다.")
    print(f"실행할 명령: {' '.join(command)}")
    # 현재 작업 디렉터리를 유지
    result = subprocess.run(command)
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(
        description="정체성.txt를 확인한 뒤 작업을 실행하는 하데스 CLI 게이트",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument("--show-identity", action="store_true", help="정체성 문서를 전체 출력합니다.")
    parser.add_argument("--summary", action="store_true", help="정체성 문서 요약을 출력합니다.")
    parser.add_argument("--lines", type=int, default=40, help="요약 출력 시 표시할 줄 수")
    parser.add_argument("--force", action="store_true", help="확인 프롬프트를 건너뜁니다.")
    parser.add_argument("--run", nargs=argparse.REMAINDER, help="실행할 명령을 지정합니다. 예: --run python main.py")
    args = parser.parse_args()

    if args.show_identity:
        print(read_spec())
        return 0

    if args.summary:
        print_summary(lines=args.lines)
        return 0

    if args.run is None or len(args.run) == 0:
        parser.print_help()
        return 1

    print_summary(lines=args.lines)
    if not args.force and not confirm_read():
        print("작업을 중단합니다. 정체성.txt를 먼저 확인하세요.")
        return 2

    return run_command(args.run)


if __name__ == "__main__":
    raise SystemExit(main())