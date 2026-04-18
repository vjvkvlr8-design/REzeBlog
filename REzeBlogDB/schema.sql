-- REzeBlog PostgreSQL Schema
-- 작성일: 2026-04-18
-- 기반: Santa Inc. 분석 (game_sessions, game_branches 구조)

-- ============================================================
-- 1. 게임 세션 테이블 (사용자별 게임 진행 상태)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,  -- 익명 사용자 UUID 또는 로그인 ID
    current_stage VARCHAR(100) DEFAULT 'intro',  -- 현재 스토리 스테이지
    turn_number INTEGER DEFAULT 0,  -- 턴 수 (진행深度)
    production_rate DECIMAL(10, 2) DEFAULT 0.0,  -- 생산률 (Santa Inc. 참고)
    unlocked_menus JSONB DEFAULT '[]',  -- 해금된 메뉴 목록
    employees JSONB DEFAULT '[]',  -- 고용된 요정/루돌프 목록
    game_state JSONB DEFAULT '{}',  -- 전체 게임 상태 (확장성)
    seo_metadata JSONB DEFAULT '{}',  -- SEO 메타데이터 (title, description, keywords)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 게임 세션 인덱스
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_current_stage ON game_sessions(current_stage);
CREATE INDEX idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX idx_game_sessions_last_active ON game_sessions(last_active_at DESC);

-- ============================================================
-- 2. 게임 분기 테이블 (스토리 분기 노드)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id VARCHAR(100) UNIQUE NOT NULL,  -- 분기 고유 ID (예: "intro", "forest", "cave")
    parent_branch_id VARCHAR(100),  -- 부모 분기 ID (트리 구조)
    stage VARCHAR(100) NOT NULL,  -- 스테이지 분류
    title VARCHAR(255) NOT NULL,  -- 분기 제목
    description TEXT,  -- 분기 설명
    content TEXT NOT NULL,  -- 스토리 텍스트 내용
    choices JSONB DEFAULT '[]',  -- 선택지 배열 [{id, text, next_branch, condition}]
    seo_title VARCHAR(255),  -- SEO용 타이틀
    seo_description TEXT,  -- SEO용 설명
    seo_keywords JSONB DEFAULT '[]',  -- SEO 키워드
    required_items JSONB DEFAULT '[]',  -- 진입 필요 아이템
    rewards JSONB DEFAULT '[]',  -- 클리어 보상
    production_rate_bonus DECIMAL(10, 2) DEFAULT 0.0,  -- 생산률 보너스
    sort_order INTEGER DEFAULT 0,  -- 표시 순서
    is_active BOOLEAN DEFAULT true,  -- 활성화 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 게임 분기 인덱스
CREATE INDEX idx_game_branches_branch_id ON game_branches(branch_id);
CREATE INDEX idx_game_branches_parent_id ON game_branches(parent_branch_id);
CREATE INDEX idx_game_branches_stage ON game_branches(stage);
CREATE INDEX idx_game_branches_sort_order ON game_branches(sort_order);
CREATE INDEX idx_game_branches_active ON game_branches(is_active) WHERE is_active = true;

-- ============================================================
-- 2.5 게임 저장 테이블 (Save/Load System)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    save_slot INTEGER NOT NULL DEFAULT 1,  -- 저장 슬롯 번호 (1-5, 0=자동저장)
    save_name VARCHAR(255) DEFAULT '저장',  -- 저장 이름
    current_stage VARCHAR(100) DEFAULT 'intro',
    turn_number INTEGER DEFAULT 0,
    production_rate DECIMAL(10, 2) DEFAULT 0.0,
    unlocked_menus JSONB DEFAULT '[]',
    employees JSONB DEFAULT '[]',
    inventory JSONB DEFAULT '[]',  -- 인벤토리 (아이템 목록)
    game_state JSONB DEFAULT '{}',
    seo_metadata JSONB DEFAULT '{}',
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, save_slot)  -- 사용자당 슬롯 중복 방지
);

-- 게임 저장 인덱스
CREATE INDEX idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX idx_game_saves_slot ON game_saves(user_id, save_slot);
CREATE INDEX idx_game_saves_saved_at ON game_saves(saved_at DESC);

-- ============================================================
-- 3. 게시글 테이블 (블로그 기본 기능)
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,  -- SEO용 URL 슬러그
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,  -- 요약 (SEO 메타 description)
    cover_image VARCHAR(500),  -- 커버 이미지 URL
    author_id VARCHAR(255) NOT NULL,
    category_id UUID,
    tags JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    seo_score INTEGER,  -- SEO 점수 (Lighthouse)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 게시글 인덱스
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(is_published, published_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- ============================================================
-- 4. 카테고리 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. 연관 게시글 추천 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS related_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    related_post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    relevance_score DECIMAL(5, 2),  -- 연관성 점수
    reason TEXT,  -- 추천 이유 (태그/카테고리/키워드)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, related_post_id)
);

CREATE INDEX idx_related_posts_post_id ON related_posts(post_id);
CREATE INDEX idx_related_posts_score ON related_posts(relevance_score DESC);

-- ============================================================
-- 6. 사용자 행동 로그 (SEO 및 게임 분석용)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    session_id UUID REFERENCES game_sessions(id),
    action_type VARCHAR(100) NOT NULL,  -- 'page_view', 'game_choice', 'scroll', 'share'
    action_data JSONB DEFAULT '{}',  -- 행동 상세 데이터
    page_url VARCHAR(500),
    referrer_url VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_logs_user_id ON user_logs(user_id);
CREATE INDEX idx_user_logs_session ON user_logs(session_id);
CREATE INDEX idx_user_logs_action ON user_logs(action_type);
CREATE INDEX idx_user_logs_created ON user_logs(created_at DESC);

-- ============================================================
-- 7. 트리거: updated_at 자동 갱신
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_branches_updated_at BEFORE UPDATE ON game_branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. 기본 데이터 삽입 (초기 게임 분기)
-- ============================================================
INSERT INTO game_branches (branch_id, stage, title, description, content, choices, seo_title, seo_description, sort_order) VALUES
('intro', 'intro', '어둠 속에서 시작', '당신은 아무것도 보이지 않는 어둠 속에 있습니다.', '주변은 온통 어둠입니다. 아무것도 보이지 않습니다. 마치 눈을 감은 것처럼... 하지만 이것은 눈을 뜨고 있는 상태입니다.', 
 '[{"id": "light_fire", "text": "🔥 불을 밝힌다", "next_branch": "fire_lit", "condition": null}, {"id": "wait", "text": "⏳ 기다린다", "next_branch": "waited", "condition": null}]',
 '어둠 속에서 시작 - REzeBlog 텍스트 어드벤처', '어둠 속에서 선택하는 인터랙티브 스토리. 당신의 선택이 이야기를 바꿉니다.', 1),

('fire_lit', 'exploration', '불꽃의 발견', '불을 밝히자 주변이 보이기 시작합니다.', '불을 밝히자 주변이 서서히 드러납니다. 낡은 오두막 안이었습니다. 벽에는 이상한 글씨가 적혀있습니다.',
 '[{"id": "read_wall", "text": "📜 벽의 글씨를 읽는다", "next_branch": "wall_text", "condition": null}, {"id": "look_around", "text": "👀 주변을 둘러본다", "next_branch": "look_around", "condition": null}]',
 '불꽃의 발견 - 텍스트 어드벤처', '불을 밝히고 발견하는 미스터리한 공간', 2);

-- ============================================================
-- 9. 코멘트 (문서화)
-- ============================================================
COMMENT ON TABLE game_sessions IS '사용자별 게임 진행 상태 저장';
COMMENT ON TABLE game_branches IS '스토리 분기 노드 및 SEO 메타데이터';
COMMENT ON TABLE posts IS '블로그 게시글 (SEO 최적화)';
COMMENT ON TABLE related_posts IS '연관 게시글 추천 알고리즘 데이터';
COMMENT ON TABLE user_logs IS '사용자 행동 분석 로그';

-- ============================================================
-- 완료
-- ============================================================
