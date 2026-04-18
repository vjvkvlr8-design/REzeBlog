# REzeBlog CI/CD 설정 가이드
# 작성일: 2026-04-18

## 개요
GitHub Actions + Vercel CLI 기반 CI/CD 파이프라인 (Docker 없이)

## 아키텍처

```
Git Push/PR
    ↓
GitHub Actions
    ├── Test & Lint (PostgreSQL 서비스 컨테이너)
    ├── Build Verification
    ├── Security Scan
    └── Deploy (Vercel CLI)
            ├── Preview (PR)
            └── Production (main 브랜치)
```

## 설정 방법

### 1. Vercel 계정 설정

```bash
# Vercel CLI 설치
npm install -g vercel

# Vercel 로그인
vercel login

# 토큰 생성 (GitHub Secrets용)
vercel tokens create
```

### 2. GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions

| Secret | 값 | 설명 |
|--------|------|------|
| `VERCEL_TOKEN` | vercel_token | Vercel API 토큰 |
| `VERCEL_ORG_ID` | org_id | Vercel 조직 ID |
| `VERCEL_PROJECT_ID` | project_id | Vercel 프로젝트 ID |

```bash
# .vercel/project.json에서 확인
{
  "orgId": "YOUR_ORG_ID",
  "projectId": "YOUR_PROJECT_ID"
}
```

### 3. Vercel 환경 변수 설정

Project Settings → Environment Variables

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## CI/CD 워크플로우

### 자동 실행 트리거

| 이벤트 | 작업 | 대상 |
|--------|------|------|
| PR 생성/업데이트 | 테스트 + 빌드 + Preview 배포 | PR 브랜치 |
| main 푸시 | 테스트 + 빌드 + Production 배포 | 프로덕션 |
| 일일 스케줄 | 보안 스캔 | - |

### 단계별 설명

#### 1. Test & Lint (test job)
```yaml
- PostgreSQL 15 서비스 컨테이너 실행
- npm ci (의존성 설치)
- npm run lint (린트 검사)
- drizzle-kit push (DB 마이그레이션)
- npm test (Jest 테스트)
- npm run benchmark (API 응답속도 < 200ms 확인)
```

#### 2. Build Verification (build job)
```yaml
- Next.js 빌드
- 아티팩트 업로드
```

#### 3. Security Scan (security job)
```yaml
- npm audit (의존성 취약점 검사)
- TruffleHog (시크릿 노출 검사)
```

#### 4. Deploy (deploy-* jobs)
```yaml
- Vercel CLI 설치
- 환경 정보 Pull
- 빌드 (vercel build)
- 배포 (vercel deploy)
```

## 로컬에서 CI 테스트

```bash
# Act 설치 (GitHub Actions 로컬 실행)
choco install act-cli

# 전체 워크플로우 테스트
act

# 특정 job만 테스트
act -j test

# PostgreSQL 포함 테스트
act -j test --container-architecture linux/amd64
```

## 문제 해결

### PostgreSQL 연결 실패 (CI)
```yaml
# GitHub Actions PostgreSQL 서비스 설정 확인
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_USER: rezeblog
      POSTGRES_PASSWORD: rezeblog123
      POSTGRES_DB: rezeblog_test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432
```

### Vercel 배포 실패
```bash
# 토큰 확인
vercel tokens list

# 프로젝트 연결 확인
vercel link

# 수동 배포 테스트
vercel --token=YOUR_TOKEN
```

### 테스트 타임아웃
```yaml
# GitHub Actions workflow에서 timeout 설정
- name: Run benchmark
  timeout-minutes: 5
```

## QA 체크포인트

- [ ] GitHub Secrets 3개 설정 완료
- [ ] Vercel 프로젝트 생성 및 연결
- [ ] 환경 변수 설정 (DATABASE_URL)
- [ ] 테스트 PR 생성 → CI 실행 확인
- [ ] main 브랜치 푸시 → Production 배포 확인
- [ ] API 응답속도 < 200ms 확인

## 모니터링

### GitHub Actions 상태
- Repository → Actions 탭
- 실패 알림: Settings → Notifications

### Vercel 모니터링
- Dashboard: https://vercel.com/dashboard
- Analytics: https://vercel.com/analytics

## 다음 단계

1. **성능 최적화**: 이미지 최적화, 코드 스플리팅
2. **보안 강화**: CSP 헤더, 보안 미들웨어
3. **접근성 개선**: ARIA 레이블, 키보드 네비게이션
