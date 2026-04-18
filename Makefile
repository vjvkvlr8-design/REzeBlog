# REzeBlog Docker Makefile
# 작성일: 2026-04-18
# 간편한 명령어 제공

.PHONY: dev up down build logs test benchmark clean

# 개발 환경 시작
up:
	docker-compose up -d

# 개발 환경 중지
down:
	docker-compose down

# 완전 재시작 (볼륨 포함)
clean:
	docker-compose down -v
	docker-compose up -d

# 로그 확인
logs:
	docker-compose logs -f

# 프론트엔드 로그만
logs-front:
	docker-compose logs -f frontend

# DB 로그만
logs-db:
	docker-compose logs -f db

# 이미지 재빌드
build:
	docker-compose build

# 셸 접속 (프론트엔드)
shell-front:
	docker-compose exec frontend sh

# 셸 접속 (DB)
shell-db:
	docker-compose exec db psql -U rezeblog -d rezeblog

# 테스트 실행 (컨테이너 내)
test:
	docker-compose exec frontend npm test

# 벤치마크 실행 (서버 실행 후)
benchmark:
	docker-compose exec frontend npm run benchmark

# DB 마이그레이션
migrate:
	docker-compose exec frontend npm run db:migrate

# DB 스튜디오 (Drizzle Studio)
studio:
	docker-compose exec frontend npm run db:studio

# 상태 확인
status:
	docker-compose ps

# 이미지/볼륨 정리 (미사용)
prune:
	docker system prune -f
	docker volume prune -f
