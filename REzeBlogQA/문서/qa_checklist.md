# REzeBlog QA 검수 체크리스트

**버전**: 1.0  
**작성일**: 2026-04-18  
**작성자**: QA 엔지니어  
**기준**: 정체성.txt, Santa Inc. 분석, 기술 스택

---

## 🔴 P0 (필수) - 프로젝트 정체성 위배 시 BLOCK

### SEO 핵심 목표 검수
| 항목 | 기준 | 검수 방법 | 실패 시 조치 |
|------|------|-----------|-------------|
| **Lighthouse SEO Score** | 90+ | Chrome DevTools → Lighthouse | 개발 중단, 수정 후 재검수 |
| **Core Web Vitals - LCP** | < 2.5초 | PageSpeed Insights | 성능 최적화 필수 |
| **Core Web Vitals - CLS** | < 0.1 | PageSpeed Insights | 레이아웃 안정성 확보 |
| **검색 노출 가능성** | robots.txt, sitemap.xml 확인 | Google Search Console 등록 | SEO 차단 요소 제거 |
| **메타데이터 완성도** | 모든 페이지 고유 title/description | <title>, <meta> 태그 확인 | 동적 메타데이터 생성 확인 |

### 정체성 위반 차단 규칙
- [ ] 게임 기능이 검색 크롤링을 차단하지 않음 (SSR 필수)
- [ ] URL 구조가 공유/색인 가능함 (쿼리파라미터 기반 상태)
- [ ] 각 게임 분기가 고유 URL로 접근 가능
- [ ] robots.txt가 중요 콘텐츠를 disallow하지 않음

---

## 🟡 P1 (핵심) - 품질 보증

### Next.js 14 App Router 검수
| 항목 | 기준 | 검수 방법 |
|------|------|-----------|
| **SSR 적용** | 페이지 소스에 콘텐츠 HTML 포함 | View Source 확인 |
| **RSC 사용** | 클라이언트 컴포넌트 최소화 | 'use client' 사용처 검토 |
| **동적 메타데이터** | generateMetadata() 사용 | 각 페이지별 메타 확인 |
| **JSON-LD** | 구조화 데이터 포함 | Google Rich Results Test |
| **에러 핸들링** | error.tsx, loading.tsx 구현 | 에러 페이지 확인 |

### PostgreSQL DB 검수
| 항목 | 기준 | 검수 방법 |
|------|------|-----------|
| **인덱스 최적화** | 외래키, 자주 조회 컬럼 인덱스 | EXPLAIN ANALYZE |
| **쿼리 성능** | 95% 쿼리 < 100ms | 로그 확인 |
| **데이터 무결성** | NOT NULL, FK 제약조건 | 스키마 확인 |
| **JSONB 활용** | 게임 상태 유연 저장 | game_sessions.state 확인 |

### 게임 UX 패턴 검수
| 항목 | 기준 | 검수 방법 | 출처 |
|------|------|-----------|------|
| **점진적 복잡성** | 초기 단순 → 점점 메뉴 추가 | 사용자 플로우 테스트 | Santa Inc. 분석 |
| **미스터리 해금** | ??? 표시로 미지 유발 | UI 확인 | Santa Inc. 분석 |
| **실시간 피드백** | 숫자/상태 변화 시각적 강조 | 애니메이션 확인 | Santa Inc. 분석 |
| **성취 메시지** | "해금" 등 보상 피드백 | 게임 진행 테스트 | Santa Inc. 분석 |
| **상태 저장** | URL + localStorage 하이브리드 | 브라우저 새로고침 테스트 | 기술 결정사항 |

---

## 🟢 P2 (모듈별) - 세부 검수

### REzeBlogDB
```sql
-- 필수 테이블 존재 확인
\dt game_sessions
\dt game_branches

-- 필수 컬럼 확인
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'game_sessions';
-- expected: id, user_id, current_stage, turn_number, production_rate, state

-- 필수 컬럼 확인
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'game_branches';
-- expected: id, stage, choice_text, result_text, next_branch_ids, seo_title, seo_description
```

- [ ] UUID 기본키 사용
- [ ] updated_at 자동 갱신 트리거
- [ ] 인덱스: user_id, current_stage, created_at

### REzeBlogBackend
| API | 메서드 | 검수 항목 |
|-----|--------|-----------|
| `/api/game/session` | POST | 세션 생성, UUID 반환 |
| `/api/game/session/[id]` | GET | 세션 상태 조회 |
| `/api/game/session/[id]` | PATCH | 상태 업데이트, 200ms 이내 |
| `/api/game/branches` | GET | 분기 목록 조회 |
| `/api/game/branches/[id]` | GET | 특정 분기 메타데이터 |

- [ ] RESTful URL 설계
- [ ] 에러 응답 통일 포맷 `{ error: string, code: number }`
- [ ] CORS 설정 확인

### REzeBlogFront
| 컴포넌트 | 검수 항목 |
|----------|-----------|
| `ClickButton` | 클릭 시 생산량 증가, 애니메이션 |
| `ProgressBar` | 실시간 생산률 표시 |
| `MenuPanel` | 해금된 메뉴 표시, ??? 미스터리 처리 |
| `GameStateProvider` | URL 쿼리 ↔ localStorage 동기화 |
| `MetaTags` | generateMetadata() 연동 |

- [ ] 다크테마 적용 (배경 #1a1a2e, 텍스트 #eaeaea)
- [ ] 반응형 디자인 (모바일 320px~ 데스크톱 1920px)
- [ ] WCAG AA 가독성 기준 충족

---

## 📋 통합 검수 플로우

### 개발자 제출 → QA 검수 프로세스

```
[개발자] 작업 완료
    ↓
[개발자] 개발기획 수정.txt에 기록 (템플릿 포맷)
    ↓
[개발자] 작업온보드.html 상태 "검수대기"로 변경
    ↓
[QA] 체크리스트 검수 수행
    ↓
[QA] 결과: 승인 / 수정요청 / 반려
    ↓
[QA] 개발기획 수정.txt에 검수 결과 기록
    ↓
[총괄디렉터] 최종 승인 (필요시)
```

---

## ✅ 검수 결과 기록 템플릿

```markdown
## 검수 기록 [YYYY-MM-DD HH:MM]

**모듈**: REzeBlogXXX
**작업자**: XXX
**검수자**: QA 엔지니어

### 검수 항목
- [ ] P0 항목 1
- [ ] P0 항목 2
- [ ] P1 항목 1

### 결과
**상태**: ✅ 승인 / 🔄 수정요청 / ❌ 반려

**의견**: 
(구체적인 피드백 내용)

**다음 조치**:
(수정요청 시 필요한 작업)
```

---

## 🚨 긴급 상황 대응

### 정체성 위반 발견 시
1. 즉시 작업 중단 요청
2. 총괄디렉터에게 보고
3. WIKI.HTML에 차단 사유 기록
4. 수정 계획 수립 후 재검수

### 기술적 장애 시
1. 에러 로그 수집
2. 개발자와 협의
3. 우회 방안 또는 롤백 결정
4. 총괄디렉터 승인 후 조치

---

**문서 상태**: ✅ 작성 완료  
**적용 모듈**: 전체 (REzeBlogDB, Backend, Front, Dashboard, System)  
**업데이트 주기**: 주간 또는 주요 기능 추가 시
