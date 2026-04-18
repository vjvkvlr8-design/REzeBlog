# Windows 로컬 개발 환경 설정 가이드
# 작성일: 2026-04-18

## 빠른 시작 (Docker 없이)

### 1. 필수 조건 확인
```powershell
# Node.js 설치 확인
node --version  # v20+ 권장
npm --version

# PostgreSQL 설치 확인 (미설치 시 아래 단계 진행)
psql --version
```

### 2. PostgreSQL 설치 (Windows)

**옵션 A: PostgreSQL 직접 설치**
1. https://www.postgresql.org/download/windows/ 방문
2. PostgreSQL 15+ 다운로드
3. 설치 시 기본 포트 5432 사용
4. 사용자: postgres / 비밀번호: 원하는 비밀번호 설정

**옵션 B: Chocolatey 사용 (권장)**
```powershell
# 관리자 PowerShell에서
choco install postgresql
```

**옵션 C: Docker Desktop 설치 (권장)**
1. https://www.docker.com/products/docker-desktop/ 방문
2. Docker Desktop for Windows 다운로드
3. WSL2 설정 (설치 중 안내 따르기)
4. 설치 후 `docker-compose up -d` 실행

### 3. 데이터베이스 설정

```powershell
# psql 접속 (postgres 사용자로)
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE rezeblog;

# 사용자 생성 (선택사항)
CREATE USER rezeblog WITH PASSWORD 'rezeblog123';
GRANT ALL PRIVILEGES ON DATABASE rezeblog TO rezeblog;

# 종료
\q
```

### 4. 스키마 적용

```powershell
# REzeBlogDB 디렉토리에서
psql -U postgres -d rezeblog -f schema.sql
psql -U postgres -d rezeblog -f seed.sql
```

### 5. Next.js 개발 서버 실행

```powershell
# REzeBlogFront 디렉토리에서
npm install
npm run dev
```

### 6. API 벤치마크 실행 (서버 실행 후)

```powershell
# 새 터미널에서
npm run benchmark
```

## 환경별 설정 비교

| 방식 | 장점 | 단점 | 권장 상황 |
|------|------|------|----------|
| **Docker** | 일관된 환경, 쉬운 클린업 | Docker Desktop 설치 필요 | 팀 개발, 배포 |
| **로컬 PostgreSQL** | 빠른 시작, IDE 디버깅 용이 | 환경 관리 필요 | 개발자 로컬 작업 |
| **WSL2 + Docker** | 리눅스 호환성 | 설정 복잡 | 고급 개발자 |

## 문제 해결

### PostgreSQL 연결 실패
```powershell
# 서비스 상태 확인
Get-Service postgresql*

# 서비스 시작
Start-Service postgresql-x64-15
```

### 포트 충돌 (5432)
```powershell
# 포트 사용 확인
netstat -ano | findstr 5432

# 프로세스 종료 (필요시)
taskkill /PID <PID> /F
```

### Node.js 버전 문제
```powershell
# nvm-windows 설치 권장
nvm install 20
nvm use 20
```

## QA 체크포인트

- [ ] PostgreSQL 서비스 실행 중
- [ ] rezeblog 데이터베이스 존재
- [ ] schema.sql 적용 완료
- [ ] seed.sql 적용 완료
- [ ] npm install 완료
- [ ] npm run dev 실행 (http://localhost:3000)
- [ ] npm run benchmark 실행 (< 200ms 목표)

## 다음 단계

### Docker Desktop 설치 후 전환
```powershell
# 1. Docker Desktop 설치
# 2. WSL2 설정 완료
# 3. 다음 명령어 실행
cd C:\REzeBlog\Main
make up
make benchmark
```

### CI/CD 준비
- GitHub Actions 설정
- 자동 테스트 및 배포 파이프라인
