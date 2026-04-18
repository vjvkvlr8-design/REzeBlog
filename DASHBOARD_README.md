# REzeBlog Dashboard
# 작성일: 2026-04-18

## 개요
게임 데이터 시각화 및 SEO 모니터링 대시보드

## 실행 방법

### 개발 서버
```bash
cd REzeBlogDashboard
npm install
npm run dev
```

### 프로덕션
```bash
npm run build
npm start
```

## 기능

### 1. 핵심 지표 (Metric Cards)
- 총 유저 수
- 총 세션 수
- 평균 턴 수
- 블로그 조회 수

### 2. 차트 시각화
- **스테이지별 유저 분포** (Pie Chart)
- **일별 활성 유저** (Line Chart, 30일)

### 3. 인기 분기 TOP 10
- 분기별 방문 수 테이블
- 분기 ID, 제목, 방문 수 표시
- **CSV/JSON 데이터보내기** 기능

### 4. SEO 모니터링 대시보드 (`/seo`)
- 네이버/구글 검색 순위 추적
- 키워드별 노출 현황
- SEO 점수 트렌드 (30일)
- 경쟁사 분석 바 차트
- 순위 변화 표시 (상승/하띠)

### 5. 반응형 디자인
- 모바일: 단일 컬럼 레이아웃
- 태블릿: 2 컬럼 그리드
- 데스크톱: 4 컬럼 그리드

## 데이터 소스
- PostgreSQL `game_sessions` 테이블
- PostgreSQL `game_branches` 테이블
- PostgreSQL `user_logs` 테이블

## 포트
- 개발: 3001
- 프로덕션: 3001

## 기술 스택
- Next.js 14 (App Router)
- React Server Components
- Recharts (시각화)
- Tailwind CSS
- PostgreSQL (postgres.js)
