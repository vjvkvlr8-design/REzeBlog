# REzeBlog 보안 강화 문서
# 작성일: 2026-04-18
# 업데이트: 2026-04-20 - Meta/Facebook 크롤러 공격 대응

## 적용된 보안 강화 (4단계)

### 1. CSP (Content Security Policy)

**파일:** `middleware.ts`

**정책:**
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data:;
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

**효과:**
- XSS 공격 방지
- 인라인 스크립트/스타일 제한
- 외부 리소스 로드 제어
- 클릭재킹 방지 (frame-ancestors)

### 2. Rate Limiting (강화됨)

**파일:** `middleware.ts`, `lib/security.ts`

**설정:**
| 엔드포인트 | 윈도우 | 최대 요청 | 변경사항 |
|-----------|--------|----------|----------|
| 일반 페이지 | 1분 | 20회 | 🔽 100→20 (크롤러 대응) |
| API | 1분 | 15회 | 🔽 30→15 (크롤러 대응) |

**응답 (429 Too Many Requests):**
```json
{
  "error": "Too many requests. Access temporarily blocked."
}
```

**헤더:**
```
Retry-After: 3600  # 1시간 차단
```

### 3. Bot Protection (신규) 🔥

**파일:** `middleware.ts`

**목적:** Meta/Facebook 크롤러의 $2,400 과금 폭탄 방지

**차단 대상:**
| User-Agent | 설명 |
|------------|------|
| `facebookexternalhit` | Meta 크롤러 (사건 원인) |
| `Facebot` | Facebook 봇 |
| `Bytespider` | ByteDance 크롤러 |
| `Amazonbot` | Amazon 크롤러 |
| `ClaudeBot` | Anthropic 크롤러 |
| `GPTBot` | OpenAI 크롤러 |
| `CCBot` | Common Crawl |

**동작 방식:**
1. User-Agent 패턴 감지 → 즉시 403 Forbidden
2. IP 블랙리스트 1시간 차단
3. Rate Limit 초과 → 자동 IP 차단
4. 콘솔 로그: `🚫 Blocked bot: {user-agent}`

**응답 (403 Forbidden):**
```json
{
  "error": "Access denied. Bot detected."
}
```

### 4. 보안 헤더

**적용 헤더:**
| 헤더 | 값 | 목적 |
|------|------|------|
| X-Content-Type-Options | nosniff | MIME 타입 스니핑 방지 |
| X-Frame-Options | DENY | 클릭재킹 방지 |
| X-XSS-Protection | 1; mode=block | XSS 필터 |
| Referrer-Policy | strict-origin-when-cross-origin | referrer 정보 제한 |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | 기능 제한 |
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | HTTPS 강제 |

## 추가 보안 기능

### lib/security.ts 유틸리티

| 함수 | 설명 | 사용처 |
|------|------|--------|
| `validateApiKey()` | API 키 검증 | 민감한 API |
| `sanitizeInput()` | SQL Injection 방지 | 사용자 입력 |
| `escapeHtml()` | XSS 방지 | HTML 출력 |
| `validateSession()` | 세션 검증 | 인증 필요 API |
| `generateSecureToken()` | 토큰 생성 | 세션/CSRF |
| `RateLimiter` 클래스 | 엔드포인트별 제한 | 특정 API |

## 캐시 전략

### 정적 자산 (JS, CSS, 이미지)
```
Cache-Control: public, max-age=31536000, immutable
```

### API 응답
```
Cache-Control: no-cache, no-store, must-revalidate
```

## 보안 체크리스트

- [x] CSP 헤더 모든 응답에 포함
- [x] Rate limiting 작동 확인 (429 응답)
- [x] HTTPS 강제 (HSTS)
- [x] SQL Injection 방지 (parameterized queries)
- [x] XSS 방지 (escapeHtml)
- [x] API 키 검증 (민감한 엔드포인트)
- [x] 보안 헤더 확인 (securityheaders.com)
- [x] **Bot Protection 활성화 (Meta 크롤러 차단)** ✅ 2026-04-20
- [x] **환경변수 분리 (docker-compose.yml 하드코딩 제거)** ✅ 2026-04-20
- [ ] Vercel Spend Management 설정 ($10 한도) ⏳ 승현 외출 후
- [ ] GitHub .env.local 제거 ⏳ 승현 외출 후

## 테스트 방법

### CSP 테스트
```bash
curl -I https://your-domain.com
# Content-Security-Policy 헤더 확인
```

### Rate Limiting 테스트
```bash
# 30회 이상 요청
for i in {1..35}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://your-domain.com/api/game
done
# 마지막에 429 확인
```

### 보안 헤더 테스트
```bash
# securityheaders.com에서 확인
# 또는
npx http-security-check https://your-domain.com
```

## 환경변수 보안 (신규) 🔐

**파일:** `.env.example`, `docker-compose.yml`

**조치:**
1. 하드코딩된 비밀번호 제거 (`rezeblog123` → 환경변수)
2. `.env.example` 템플릿 제공
3. `.env` 파일 `.gitignore`에 포함 확인

**사용법:**
```bash
# 1. .env 파일 생성
cp .env.example .env

# 2. 비밀번호 변경
# .env 파일 편집:
# POSTGRES_PASSWORD=your_secure_random_password

# 3. Docker 실행
docker-compose up -d
```

**⚠️ 주의:** `.env` 파일을 절대 Git에 커밋하지 마세요!

---

## 추가 권장사항

1. **Redis Rate Limiting** - 다중 인스턴스 환경
2. **CSRF Protection** - 폼 제출 시
3. **Input Validation** - Zod 라이브러리 사용
4. **Audit Logging** - 보안 이벤트 기록
5. **Dependency Scanning** - npm audit 자동화
6. **Vercel Spend Management** - $10 과금 한도 설정
