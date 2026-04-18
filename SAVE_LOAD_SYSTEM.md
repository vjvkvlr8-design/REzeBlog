# REzeBlog 저장/로드 시스템 문서
# 작성일: 2026-04-18
# 기능: 게임 진행 상태 저장 및 복원

## 개요
사용자의 게임 진행 상태를 PostgreSQL에 저장하고 복원하는 시스템

## 기능

### 1. 저장 슬롯 시스템
| 슬롯 | 용도 | 설명 |
|------|------|------|
| 0 | 자동 저장 | 게임 진행 시 자동 저장 |
| 1-5 | 수동 저장 | 사용자가 직접 저장 |

### 2. 저장 데이터
```typescript
{
  currentStage: string      // 현재 스토리 스테이지
  turnNumber: number        // 턴 수
  productionRate: number   // 생산률
  unlockedMenus: string[]   // 해금된 메뉴
  employees: any[]        // 고용된 캐릭터
  inventory: any[]         // 인벤토리 (아이템)
  gameState: object        // 전체 게임 상태
  seoMetadata: object      // SEO 메타데이터
}
```

## API 엔드포인트

### 저장 목록 조회
```http
GET /api/saves?list=true
Headers: x-user-id: {userId}

Response: { saves: SaveSlot[], count: number }
```

### 특정 슬롯 로드
```http
GET /api/saves?slot={slot}
Headers: x-user-id: {userId}

Response: { save: SaveData, slot: number }
```

### 게임 저장
```http
POST /api/saves
Headers: 
  Content-Type: application/json
  x-user-id: {userId}

Body: {
  slot: number        // 0-5
  name: string       // 저장 이름
  currentStage: string
  turnNumber: number
  ...
}

Response: { save: SaveData, slot: number }
```

### 저장 삭제
```http
DELETE /api/saves?slot={slot}
Headers: x-user-id: {userId}

Response: { deleted: true, slot: number }
```

## 클라이언트 훅 사용법

```typescript
import { useSaveLoad } from '@/hooks/useSaveLoad'

function GameComponent() {
  const { isLoading, error, save, load, getSaves, autoSave } = useSaveLoad('user-123')

  // 저장
  const handleSave = async () => {
    const success = await save(1, '중간 저장', {
      currentStage: 'forest',
      turnNumber: 10,
      productionRate: 5.5,
      inventory: ['torch', 'map']
    })
    if (success) alert('저장 완료!')
  }

  // 로드
  const handleLoad = async () => {
    const data = await load(1)
    if (data) {
      setGameState(data)
      alert('로드 완료!')
    }
  }

  // 자동 저장
  useEffect(() => {
    const interval = setInterval(() => {
      autoSave(currentGameState)
    }, 60000) // 1분마다 자동 저장
    return () => clearInterval(interval)
  }, [])
}
```

## 데이터베이스 스키마

```sql
CREATE TABLE game_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    save_slot INTEGER NOT NULL DEFAULT 1,
    save_name VARCHAR(255) DEFAULT '저장',
    current_stage VARCHAR(100) DEFAULT 'intro',
    turn_number INTEGER DEFAULT 0,
    production_rate DECIMAL(10, 2) DEFAULT 0.0,
    unlocked_menus JSONB DEFAULT '[]',
    employees JSONB DEFAULT '[]',
    inventory JSONB DEFAULT '[]',
    game_state JSONB DEFAULT '{}',
    seo_metadata JSONB DEFAULT '{}',
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, save_slot)
);
```

## 테스트 방법

```bash
# 저장 테스트
curl -X POST http://localhost:3000/api/saves \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "slot": 1,
    "name": "테스트 저장",
    "currentStage": "forest",
    "turnNumber": 5
  }'

# 로드 테스트
curl http://localhost:3000/api/saves?slot=1 \
  -H "x-user-id: test-user"

# 목록 조회
curl http://localhost:3000/api/saves?list=true \
  -H "x-user-id: test-user"
```

## 보안 고려사항
1. 사용자 인증 연동 시 JWT 토큰 검증 필요
2. 저장 데이터 유효성 검사 (스키마 검증)
3. 사용자당 최대 저장 슬롯 제한 (5개)
4. 저장 데이터 크기 제한 (1MB)

## TODO
- [ ] 클라우드 동기화 (Vercel Edge Config)
- [ ] 저장 데이터 암호화
- [ ] 저장 공유 기능 (공유 코드)
- [ ] 저장 복원 UI 컴포넌트
