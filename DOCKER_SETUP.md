# REzeBlog Docker 개발 환경 설정
# 작성일: 2026-04-18

## 빠른 시작

```bash
# 1. Docker Compose 실행 (Main 디렉토리에서)
cd C:\REzeBlog\Main
docker-compose up -d

# 또는 Makefile 사용 (Git Bash 또는 WSL 필요)
make up
```

## 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Frontend (Next.js) | 3000 | 메인 웹 애플리케이션 |
| PostgreSQL | 5432 | 데이터베이스 |
| Redis | 6379 | 세션 캐시 (선택) |

## 환경 변수

`.env.local` 파일에 다음 변수 설정:

```
DATABASE_URL=postgresql://rezeblog:rezeblog123@localhost:5432/rezeblog
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Makefile 명령어

```bash
make up          # 개발 환경 시작
make down        # 개발 환경 중지
make logs        # 로그 실시간 확인
make logs-front  # 프론트엔드 로그만
make logs-db     # DB 로그만
make build       # 이미지 재빌드
make test        # 테스트 실행
make benchmark   # API 벤치마크 실행
make shell-front # 프론트엔드 셸 접속
make shell-db    # DB 셸 접속 (psql)
make status      # 상태 확인
make clean       # 완전 재시작 (볼륨 삭제)
```

## 데이터베이스 초기화

PostgreSQL 컨테이너 시작 시 자동 실행:
1. `schema.sql` - 테이블 생성
2. `seed.sql` - 초기 데이터 삽입

## API 벤치마크 실행

```bash
# 1. 개발 환경 시작
make up

# 2. 서버 준비 대기 (10초)
sleep 10

# 3. 벤치마크 실행 (컨테이너 내부)
make benchmark

# 또는 직접 실행
docker-compose exec frontend npm run benchmark
```

## 문제 해결

### 포트 충돌
```bash
# 5432 포트가 사용중인 경우
# docker-compose.yml의 포트 매핑 변경:
# "5433:5432" 등으로 수정
```

### DB 연결 실패
```bash
# DB 상태 확인
make logs-db

# DB 재시작
make down
docker volume rm main_postgres_data
make up
```

### 핫 리로드 안됨
```bash
# docker-compose.override.yml 확인
# WATCHPACK_POLLING=true 설정됨
```

## 프로덕션 배포

```bash
# 프로덕션 환경
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## QA 체크포인트

- [ ] `make up` 후 모든 컨테이너 정상 실행
- [ ] http://localhost:3000 접속 확인
- [ ] http://localhost:5432 PostgreSQL 접속 확인
- [ ] `make benchmark` API 응답속도 < 200ms 확인
- [ ] `make test` 테스트 통과 확인
