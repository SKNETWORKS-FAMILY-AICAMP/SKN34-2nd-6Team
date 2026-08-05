/**
 * featureLinks.js
 * ---------------------------------------------------------------------------
 * 헤더 네비 + 홈 기능 섹션이 공유하는 진입점 목록.
 * 나중에 `name` / `teaser` 만 실제 기능명으로 바꾸면 전체가 함께 갱신됩니다.
 * path / id 는 라우트와 맞춰 유지하세요.
 * ---------------------------------------------------------------------------
 */

export const FEATURE_LINKS = [
  { id: 'donors', name: '기부자 관리', path: '/donors', teaser: '일괄 이탈 예측 · 기부자 관리' },
  { id: 'insights', name: '통계 및 솔루션', path: '/insights', teaser: '이탈 통계 분석 · 인구통계별 맞춤 솔루션' },
  { id: 'models', name: '모델 히스토리', path: '/models', teaser: '모델 선별 과정에 대해 설명합니다' },
  { id: 'mypage', name: '마이페이지', path: '/mypage', teaser: '프로필 · 활동 기록' },
]

/** 헤더 가운데 네비 (마이페이지 제외) */
export const NAV_LINKS = FEATURE_LINKS.filter((item) => item.id !== 'mypage')

/** 헤더 오른쪽 마이페이지 링크 */
export const MY_PAGE_LINK = FEATURE_LINKS.find((item) => item.id === 'mypage')
