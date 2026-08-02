/**
 * churnDriverData.js — 핵심 요인(상관관계) 정적 폴백
 * 백엔드 GET /api/v1/insights/churn-drivers 가 없을 때 UI가 깨지지 않도록 사용.
 * 출처: 학습 원본 분석·인구통계 인사이트와 같은 방향의 요약값.
 */
export const FALLBACK_CHURN_DRIVERS = {
  n_samples: 2014,
  n_churned: 519,
  source: 'fallback',
  drivers: [
    {
      rank: 1,
      feature: 'employment',
      label: '고용 상태',
      correlation: 0.28,
      direction: 'positive',
      insight:
        '실업·미취업·퇴직 등 소득이 불안정한 상태에서 이탈 위험이 높습니다. 감액·일시정지 옵션을 선제 안내해 완전 이탈 대신 관계를 유지하세요.',
    },
    {
      rank: 2,
      feature: 'religion_none',
      label: '무종교 여부',
      correlation: 0.22,
      direction: 'positive',
      insight:
        '무종교 응답자의 이탈률이 상대적으로 높습니다. 커뮤니티 연결이 약한 만큼 뉴스레터·성과 리포트로 신뢰를 꾸준히 쌓으세요.',
    },
    {
      rank: 3,
      feature: 'education',
      label: '학력(고졸 이하)',
      correlation: 0.18,
      direction: 'positive',
      insight:
        '학력이 낮을수록 이탈률이 높은 편입니다. 앱·온라인보다 전화·우편 등 접근성 높은 채널과 쉬운 설명 자료를 우선하세요.',
    },
    {
      rank: 4,
      feature: 'income_low',
      label: '저소득 구간',
      correlation: 0.16,
      direction: 'positive',
      insight:
        '월평균 소득이 낮은 구간에서 이탈률이 높습니다. 소액 정기 후원·유연한 결제 주기로 부담을 낮춰 주세요.',
    },
    {
      rank: 5,
      feature: 'age_60s',
      label: '연령(60대)',
      correlation: 0.14,
      direction: 'positive',
      insight:
        '60대 이탈률이 높게 나타납니다. 전화 상담처럼 대면성이 높은 채널로 안부를 확인하고 관계를 유지하세요.',
    },
    {
      rank: 6,
      feature: 'regular_employee',
      label: '상용근로 여부',
      correlation: -0.19,
      direction: 'negative',
      insight:
        '상용근로자일수록 이탈 위험이 상대적으로 낮습니다. 안정 기부자에게는 성과 공유·감사 메시지로 장기 관계를 강화하세요.',
    },
  ],
}
