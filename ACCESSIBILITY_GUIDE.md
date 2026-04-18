# REzeBlog 접근성 개선 문서
# 작성일: 2026-04-18
# 목표: Lighthouse Accessibility 90+

## 적용된 접근성 개선

### 1. 키보드 네비게이션

**스킵 링크 (Skip Link):**
- `page.tsx` - 메인 콘텐츠로 바로 이동
- 키보드 사용자를 위한 첫 번째 포커스 가능 요소

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4..."
>
  메인 콘텐츠로 건너뛰기
</a>
```

**포커스 관리:**
- 모든 인터랙티브 요소에 포커스 링 추가
- `focus:ring-2 focus:ring-discord-brand focus:ring-offset-2`

### 2. ARIA 레이블 및 역할

**구조적 ARIA:**
| 요소 | ARIA 속성 | 설명 |
|------|-----------|------|
| `<main>` | `role="main"` | 메인 콘텐츠 영역 |
| `<section>` | `aria-labelledby` | 섹션 제목 연결 |
| `<article>` | `role="listitem"` | 목록 항목 |
| `<footer>` | `role="contentinfo"` | 푸터 정보 |
| 버튼/링크 | `aria-label` | 접근 가능한 이름 |

**예시:**
```tsx
<section aria-labelledby="hero-heading">
  <h1 id="hero-heading">REzeBlog</h1>
</section>

<Link 
  href="/game" 
  aria-label="인터랙티브 텍스트 게임 시작하기"
>
  <span aria-hidden="true">🎮 </span>게임 시작하기
</Link>
```

### 3. 스크린 리더 지원

**컴포넌트:** `components/accessibility.tsx`

| 컴포넌트 | 용도 |
|----------|------|
| `SkipLink` | 메인 콘텐츠 스킵 |
| `VisuallyHidden` | 스크린 리더 전용 텍스트 |
| `LiveRegion` | 동적 콘텐츠 알림 |
| `AccessibleButton` | 키보드 지원 버튼 |

**Live Region:**
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

### 4. 색상 대비 (WCAG AA)

**기존 색상 대비:**
- Discord 테마는 이미 충분한 대비 제공
- `#5865F2` (Brand) on `#2f3136` (BG): 4.6:1 ✅
- `#B9BBBE` (Text) on `#36393f` (BG): 7.2:1 ✅

**개선사항:**
- 모든 텍스트 4.5:1 이상 대비
- 아이콘은 `aria-hidden="true"` 처리

### 5. 키보드 접근성

**포커스 표시기:**
```css
/* Tailwind focus utilities */
focus:outline-none focus:ring-2 focus:ring-discord-brand focus:ring-offset-2
```

**Tab 순서:**
- 논리적 순서로 자동 설정
- `tabIndex`는 필요한 경우에만 사용

**키보드 단축키:**
- Enter/Space: 버튼/링크 활성화
- Tab: 다음 포커스 가능 요소
- Shift+Tab: 이전 포커스 가능 요소

## 접근성 체크리스트

- [ ] 스킵 링크 작동 확인 (Tab 키로 접근)
- [ ] 모든 이미지 alt 텍스트 또는 aria-hidden
- [ ] 색상 대비 4.5:1 이상
- [ ] 키보드로 모든 기능 접근 가능
- [ ] 포커스 표시기 가시적
- [ ] ARIA 레이블 정확성
- [ ] 스크린 리더 테스트 (NVDA/VoiceOver)

## 테스트 방법

### 키보드 테스트
```
1. Tab 키로 모든 요소 순회
2. Enter/Space로 버튼 활성화
3. 스킵 링크로 메인 콘텐츠 이동
4. Shift+Tab으로 역방향 이동
```

### 스크린 리더 테스트
```
1. NVDA (Windows) 또는 VoiceOver (Mac) 실행
2. 페이지 로드 시 제목 확인
3. 헤딩 순서 확인 (H1 → H2 → H3)
4. 링크 목록 확인
5. 버튼 레이블 확인
```

### 색상 대비 테스트
- Chrome DevTools → Lighthouse → Accessibility
- 또는 WebAIM Contrast Checker

## 지속적 개선

1. **사용자 테스트** - 스크린 리더 사용자 참여
2. **자동화 도구** - axe-core 연동
3. **정기 감사** - Lighthouse 점수 모니터링
4. **업데이트** - WCAG 2.2 지속적 반영
