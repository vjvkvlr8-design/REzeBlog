-- REzeBlog 초기 데이터
-- 작성일: 2026-04-18

-- 게임 분기 데이터 삽입
INSERT INTO game_branches (branch_id, title, stage, description, story_text, choices, seo_title, seo_description, seo_keywords, sort_order) VALUES
(
  'intro',
  '어둠 속에서 시작하는 이야기',
  'intro',
  'REzeBlog의 첫 번째 인터랙티브 스토리',
  '당신은 어둠 속에서 눈을 뜹니다. 주변을 아무것도 볼 수 없습니다. 손을 뻗어보니 차가운 콘크리트 벽이 닿습니다. 이곳은 어디일까요?',
  '[
    {"id": "light_fire", "text": "라이터를 찾아 불을 켠다", "next_branch": "fire_lit"},
    {"id": "explore_dark", "text": "어둠 속을 더 탐험한다", "next_branch": "dark_explore"},
    {"id": "call_help", "text": "도움을 요청한다", "next_branch": "help_called"}
  ]',
  '어둠 속에서 시작하는 이야기 - REzeBlog 인터랙티브 스토리',
  '당신의 선택이 세상을 바꾸는 인터랙티브 스토리텔링. REzeBlog에서 첫 번째 이야기를 시작하세요.',
  '{"인터랙티브 스토리", "텍스트 게임", "어드벤처", "REzeBlog"}',
  1
),
(
  'fire_lit',
  '불이 켜진 순간',
  'intro',
  '불을 켜자 주변이 보이기 시작합니다',
  '라이터의 불꽃이 타오르자, 당신은 이곳이 버려진 지하실임을 알게 됩니다. 먼지 쌓인 책상 위에는 오래된 노트북이 놓여있습니다.',
  '[
    {"id": "check_laptop", "text": "노트북을 확인한다", "next_branch": "laptop_found"},
    {"id": "search_exit", "text": "출구를 찾는다", "next_branch": "exit_search"}
  ]',
  '불이 켜진 순간 - REzeBlog',
  '어둠을 밝히고 새로운 발견을 하는 순간. REzeBlog 인터랙티브 스토리의 두 번째 장면입니다.',
  '{"인터랙티브 스토리", "스토리텔링", "게임"}',
  2
),
(
  'dark_explore',
  '어둠 속의 발견',
  'intro',
  '어둠 속에서 무언가를 발견했습니다',
  '당신은 조심스럽게 어둠 속을 걸어갑니다. 발 아래 무언가가 부서지는 소리가 들립니다. 휴대폰 손전등을 켜자, 유리 조각들이 반짝입니다.',
  '[
    {"id": "pick_glass", "text": "유리 조각을 줍는다", "next_branch": "glass_picked"},
    {"id": "avoid_glass", "text": "조심히 피해간다", "next_branch": "careful_move"}
  ]',
  '어둠 속의 발견 - REzeBlog',
  '어둠 속에서의 발견이 당신의 운명을 바꿉니다. REzeBlog 인터랙티브 스토리.',
  '{"인터랙티브", "스토리", "텍스트 게임"}',
  3
),
(
  'help_called',
  '도움의 소리',
  'intro',
  '당신의 목소리가 메아리칩니다',
  '"살려주세요!" 당신의 목소리가 벽에 부딪혀 메아리칩니다. 잠시 후, 멀리서 발소리가 들려옵니다.',
  '[
    {"id": "hide", "text": "숨는다", "next_branch": "hiding"},
    {"id": "call_again", "text": "다시 소리친다", "next_branch": "calling_again"}
  ]',
  '도움의 소리 - REzeBlog',
  '혼자가 아닙니다. 도움을 요청하는 순간이 변화의 시작입니다.',
  '{"인터랙티브 스토리", "어드벤처", "게임"}',
  4
);

-- 카테고리 데이터 삽입
INSERT INTO categories (name, slug, description) VALUES
('인터랙티브 스토리', 'interactive-story', '당신의 선택으로 진행되는 인터랙티브 스토리텔링'),
('개발 일지', 'dev-log', 'REzeBlog 개발 과정과 기술 이야기'),
('기술 튜토리얼', 'tutorial', 'Next.js, PostgreSQL 등 기술 가이드'),
('사이드 프로젝트', 'side-project', '1인 개발자의 프로젝트 여정');

-- 샘플 게시글 삽입
INSERT INTO posts (title, slug, excerpt, content, category_id, published_at, is_published) VALUES
(
  '어둠 속에서 시작하는 이야기',
  'darkness-story',
  'REzeBlog의 첫 번째 인터랙티브 스토리. 당신의 선택이 세상을 바꿉니다.',
  '이것은 인터랙티브 스토리의 시작입니다. 게임 페이지에서 직접 체험해보세요.',
  1,
  CURRENT_TIMESTAMP,
  true
);
