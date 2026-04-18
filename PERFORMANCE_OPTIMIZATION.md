# REzeBlog 성능 최적화 문서
# 작성일: 2026-04-18

## 적용된 최적화

### 1. 이미지 최적화 (next/image)

**next.config.js 설정:**
```javascript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
}
```

**최적화 컴포넌트:**
- `components/image-optimized.tsx` - lazy loading, blur placeholder
- WebP/AVIF 자동 변환
- 반응형 이미지 크기

### 2. 폰트 최적화 (next/font)

**layout.tsx 설정:**
```typescript
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',    // FOUT 방지
  preload: true,      // 미리 로드
})
```

**효과:**
- Google Fonts 자동 호스팅
- CSS 변수로 폰트 관리
- font-display: swap 적용

### 3. 코드 스플리팅 및 번들 최적화

**next.config.js:**
```javascript
swcMinify: true,
compiler: {
  removeConsole: process.env.NODE_ENV === 'production',
},
experimental: {
  optimizePackageImports: ['lucide-react', 'framer-motion'],
}
```

**Suspense 로딩:**
- `app/loading.tsx` - 글로벌 로딩 UI
- 동적 임포트 자동 코드 분할

### 4. 성능 관련 보안 헤더

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

## Lighthouse 예상 점수

| 카테고리 | 목표 | 현재 예상 |
|----------|------|----------|
| Performance | 90+ | 85-90 |
| Accessibility | 90+ | 90+ |
| Best Practices | 90+ | 95+ |
| SEO | 95+ | 95+ |

## 측정 방법

### 로컬 테스트
```bash
# Lighthouse CI 설치
npm install -g @lhci/cli

# 테스트 실행
lhci autorun
```

### Chrome DevTools
1. F12 개발자 도구 열기
2. Lighthouse 탭 선택
3. "Analyze page load" 클릭

## 추가 최적화 가능 영역

1. **이미지 WebP 변환** - 소스 이미지를 WebP로 변환
2. **Service Worker** - 오프라인 캐싱
3. **Preconnect** - 외부 도메인 연결 최적화
4. **Resource Hints** - dns-prefetch, preconnect

## QA 체크포인트

- [ ] Lighthouse Performance 85+ 확인
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1
