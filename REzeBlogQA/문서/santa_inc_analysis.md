# ParkSB Santa Inc. UI/UX 분석 보고서

**분석일**: 2026-04-18  
**분석자**: QA 엔지니어  
**대상**: https://parksb.github.io/santa-inc/

---

## 1. 개요

Santa Inc.는 텍스트 기반의 인크리멘탈 게임(Incremental Game)으로, 단순한 클릭 인터페이스에서 시작해 복잡한 경영 시스템으로 확장되는 구조입니다.

---

## 2. 인터랙션 플로우 분석

### 2.1 초기 진입 플로우
```
[진입] → [CLICK!] → [생산 카운터 증가] → [메뉴 잠금 해제] → [고용/정책/인사 확장]
```

### 2.2 핵심 인터랙션 패턴
| 단계 | 요소 | 설명 |
|------|------|------|
| 1 | **메인 CTA** | "CLICK!" - 단순한 시작점 |
| 2 | **실시간 피드백** | "1초당 N개 생산중" - 진행 상태 표시 |
| 3 | **점진적 기능 해금** | ??? 표시로 미스터리 유발, 일정 조건 충족 시 해금 |
| 4 | **메뉴 확장** | 고용 → 정책 → 인사 순으로 복잡도 증가 |

### 2.3 게임 상태 모델
```typescript
interface GameState {
  productionPerSecond: number;  // 생산률
  totalProduction: number;      // 누적 생산량
  unlockedMenus: string[];      // 해금된 메뉴
  employees: Employee[];        // 고용 인력
  policies: Policy[];           // 적용 정책
}
```

---

## 3. SEO 친화적 구조 분석

### 3.1 현재 상태 (개선 필요)
| 항목 | 상태 | 개선 제안 |
|------|------|-----------|
| **메타 태그** | OG Description 존재 | 각 게임 상태별 동적 meta title/description 필요 |
| **URL 구조** | 단일 페이지 | `/game?stage=hiring&turn=5` 형태의 쿼리파라미터 적용 |
| **콘텐츠 가시성** | JS 렌더링 의존 | SSR로 초기 상태 HTML 제공 |
| **시멘틱 마크업** | 미흡 | `<article>`, `<section>` + JSON-LD 구조화 데이터 |

### 3.2 REzeBlog 적용 방안
```html
<!-- 게임 상태별 메타 -->
<title>회사경영 게임 - 5일차 고용단계 | REzeBlog</title>
<meta name="description" content="게임 진행상황: 1초당 30개 생산, 5명 고용완료">

<!-- JSON-LD 구조화 데이터 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "텍스트 경영 시뮬레이션 - 5일차",
  "description": "1초당 30개 생산중, 고용 5명",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/PlayGameAction",
    "userInteractionCount": "1234"
  }
}
</script>
```

---

## 4. UI/UX 벤치마크

### 4.1 다크테마 적용 포인트
| 요소 | Santa Inc | REzeBlog 적용 |
|------|-----------|---------------|
| **배경** | 검정/어두운 회색 | #1a1a2e 또는 #16213e (Discord 느낌) |
| **텍스트** | 밝은 회색/흰색 | #e94560 포인트 색상 + #eaeaea 본문 |
| **강조** | ??? 미스터리 표시 | 게임 분기별 색상 차별화 |
| **애니메이션** | 숫자 카운팅 | 생산량 변화 시 부드러운 transition |

### 4.2 텍스트 게임 UX 패턴
1. **점진적 복잡성**: 처음엔 단순 클릭 → 점점 메뉴 추가
2. **미스터리 효과**: ???로 미지의 요소 유발
3. **실시간 피드백**: 숫자 변화 시각적 강조
4. **성취感**: "해금" 메시지로 보상 제공

---

## 5. 게임-블로그 통합 설계

### 5.1 데이터 모델 (PostgreSQL)
```sql
-- 게임 세션
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  current_stage VARCHAR(50), -- 'tutorial', 'hiring', 'policy', 'hr'
  turn_number INTEGER,
  production_rate INTEGER,
  state JSONB, -- 전체 게임 상태
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 게임 분기 (스토리 노드)
CREATE TABLE game_branches (
  id UUID PRIMARY KEY,
  stage VARCHAR(50),
  choice_text TEXT,
  result_text TEXT,
  next_branch_ids UUID[],
  seo_title VARCHAR(100),
  seo_description TEXT
);
```

### 5.2 URL 설계
```
/blog/[slug]/game?session=abc123&stage=3&turn=5
→ 공유 가능한 게임 상태 URL
→ 각 stage별 고유 메타데이터 생성
```

---

## 6. QA 체크리스트

### 게임 기능 테스트
- [ ] 클릭 시 생산량 증가 확인
- [ ] 일정 생산량 도달 시 메뉴 해금 확인
- [ ] URL 공유 시 동일 상태 복원 확인
- [ ] 브라우저 새로고침 후 상태 유지 확인 (localStorage)

### SEO 테스트
- [ ] 각 stage별 고유 meta title 존재
- [ ] JSON-LD 구조화 데이터 유효성 (Google Rich Results Test)
- [ ] SSR 렌더링 HTML에 게임 상태 텍스트 포함
- [ ] Lighthouse SEO Score 90+ 달성

### UX 테스트
- [ ] 다크테마 가독성 (WCAG AA 기준)
- [ ] 모바일 반응형 인터랙션
- [ ] 텍스트 게임 진행 플로우 자연스러움

---

## 7. 결론 및 권장사항

**핵심 인사이트**:
1. Santa Inc.의 "점진적 복잡성"과 "미스터리 해금" 패턴은 REzeBlog 텍스트 게임에 적용 권장
2. SEO를 위해 반드시 **URL 기반 상태 관리 + SSR** 적용 필요
3. 각 게임 분기를 **독립적인 블로그 콘텐츠**처럼 메타데이터 관리

**다음 단계**:
1. DB 스키마 설계 (game_sessions, game_branches 테이블)
2. Next.js API Routes (세션 생성/조회/업데이트)
3. 프론트 게임 UI 컴포넌트 (ClickButton, ProgressBar, MenuUnlock)

---

**산출물**: `문서/santa_inc_analysis.md`  
**상태**: ✅ 분석 완료, 개발팀 배포 대기
