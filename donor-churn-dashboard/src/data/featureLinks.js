/**
 * featureLinks.js
 * ---------------------------------------------------------------------------
 * 헤더 네비 + 홈 기능 섹션이 공유하는 진입점 목록.
 * 나중에 `name` / `teaser` 만 실제 기능명으로 바꾸면 전체가 함께 갱신됩니다.
 * path / id 는 라우트와 맞춰 유지하세요.
 * ---------------------------------------------------------------------------
 */

export const FEATURE_LINKS = [
  { id: 'daeho', name: '기부자 관리', path: '/daeho', teaser: '일괄 이탈 예측 · 기부자 관리' },
  { id: 'jeongseok', name: '정석', path: '/jeongseok', teaser: '담당 기능 구현 예정' },
  { id: 'hosun', name: '모델 히스토리', path: '/hosun', teaser: '모델 선별 과정에 대해 설명합니다' },
  { id: 'jinhwa', name: '진화', path: '/jinhwa', teaser: '담당 기능 구현 예정' },
  { id: 'jiyun', name: '마이페이지', path: '/jiyun', teaser: '프로필 · 활동 기록' },
]

/** 헤더 가운데 네비 (마이페이지 제외) */
export const NAV_LINKS = FEATURE_LINKS.filter((item) => item.id !== 'jiyun')

/** 헤더 오른쪽 마이페이지 링크 */
export const MY_PAGE_LINK = FEATURE_LINKS.find((item) => item.id === 'jiyun')
