# REzeBlog 보안 강화 문서
# 작성일: 2026-04-18

## 적용된 보안 강화 (3단계)

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

### 2. Rate Limiting

**파일:** `middleware.ts`, `lib/security.ts`

**설정:**
| 엔드포인트 | 윈도우 | 최대 요청 |
|-----------|--------|----------|
| 일반 페이지 | 1분 | 100회 |
| API | 1분 | 30회 |

**응답 (429 Too Many Requests):**
```json
{
  "error": "Too many requests. Please try again later."
}
```

**헤더:**
```
Retry-After: 60
```

### 3. 보안 헤더

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

- [ ] CSP 헤더 모든 응답에 포함
- [ ] Rate limiting 작동 확인 (429 응답)
- [ ] HTTPS 강제 (HSTS)
- [ ] SQL Injection 방지 (parameterized queries)
- [ ] XSS 방지 (escapeHtml)
- [ ] API 키 검증 (민감한 엔드포인트)
- [ ] 보안 헤더 확인 (securityheaders.com)

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

## 추가 권장사항

1. **Redis Rate Limiting** - 다중 인스턴스 환경
2. **CSRF Protection** - 폼 제출 시
3. **Input Validation** - Zod 라이브러리 사용
4. **Audit Logging** - 보안 이벤트 기록
5. **Dependency Scanning** - npm audit 자동화
