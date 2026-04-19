# Supabase PostgreSQL 연결 가이드

## 1. Supabase 프로젝트 생성

###步骤
1. https://supabase.com/dashboard 접속
2. "New Project" 클릭
3. 프로젝트 이름: `rezeblog`
4. 데이터베이스 비밀번호 설정 (안전한 곳에 저장)
5. 리전: `Seoul (Northeast Asia)` 선택
6. "Create new project" 클릭

## 2. 데이터베이스 연결 문자열

### Connection String 형식
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 예시
```
postgresql://postgres:MySecurePassword123!@db.abc123xyz.supabase.co:5432/postgres
```

## 3. 환경변수 설정

### 로컬 개발 (.env.local)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Vercel 배포 환경
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add New:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
3. Deploy again to apply

## 4. 스키마 마이그레이션

### Supabase SQL Editor 사용
1. Supabase Dashboard → SQL Editor
2. `schema.sql` 내용 복사 → New Query → Paste → Run
3. `seed.sql` 내용 복사 → Run (테스트 데이터)

### 또는 drizzle-kit 사용
```bash
cd REzeBlogFront
npx drizzle-kit push:pg
```

## 5. 연결 테스트

### API 테스트
```bash
# 게임 분기 조회
curl https://rezeblog.vercel.app/api/branches

# 게임 세션 생성
curl -X POST https://rezeblog.vercel.app/api/game \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123","currentStage":"intro"}'
```

### 로컬 테스트
```bash
cd REzeBlogFront
npm run dev
# http://localhost:3000/api/branches 접속
```

## 6. 보안 설정

### Row Level Security (RLS)
```sql
-- 게임 세션 테이블 RLS 활성화
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can only access their own sessions" ON game_sessions
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::UUID);
```

### IP 제한 (선택)
1. Supabase Dashboard → Database → Network Restrictions
2. Vercel IP 범위 추가 (필요시)

## 7. 모니터링

### Supabase Dashboard
- Database → Tables: 실시간 데이터 확인
- Logs: API 요청 로그
- Usage: 연결 수, 쿼리 성능

### Vercel Logs
- Project → Logs: 함수 실행 로그
- Real-time: 실시간 에러 모니터링

## 8. 백업 설정

### 자동 백업
- Supabase 무료 티어: 7일 자동 백업
- Pro 티어: 30일 백업 + PITR

### 수동 백업
```bash
pg_dump DATABASE_URL > backup.sql
```

## 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] Database URL 복사
- [ ] Vercel 환경변수 설정
- [ ] 스키마 마이그레이션
- [ ] 시드 데이터 삽입
- [ ] API 연결 테스트
- [ ] RLS 정책 설정 (선택)

## 문제 해결

### "연결 시간 초과" 에러
- SSL 설정 확인: `ssl: { rejectUnauthorized: false }`
- Supabase IP 제한 확인

### "테이블 없음" 에러  
- 스키마 마이그레이션 완료 확인
- `drizzle-kit push:pg` 재실행

### "권한 거부" 에러
- DATABASE_URL 포맷 확인
- 비밀번호 특수문자 인코딩 확인
