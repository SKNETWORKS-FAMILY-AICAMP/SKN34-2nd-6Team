/**
 * demographicChurnData.js — 인구통계별 실제 이탈율 데이터
 * 출처: 학습 원본 데이터(data/20250703_005327.xlsx) 전수 분석 결과를 정적으로 반영.
 * (표본 20명 미만 구간은 신뢰도가 낮아 제외)
 * 정석 담당 폴더 전용 — 팀 공용 파일(services/api.js 등)에는 의존하지 않음.
 */

export const DEMOGRAPHIC_CHURN = [
  {
    id: 'age',
    title: '연령대별 이탈율',
    unit: '세',
    buckets: [
      { label: '29세 이하', rate: 26.9, count: 342 },
      { label: '30대', rate: 21.0, count: 328 },
      { label: '40대', rate: 24.2, count: 393 },
      { label: '50대', rate: 26.1, count: 410 },
      { label: '60대', rate: 30.0, count: 400 },
      { label: '70세 이상', rate: 26.2, count: 141 },
    ],
    solution:
      '60대 기부자의 이탈률이 가장 높습니다(30.0%). 건강·시간 여유 등 생애주기 변화가 원인일 수 있으니, 전화 상담처럼 대면성이 높은 채널로 안부를 확인하고 관계를 유지하는 데 우선순위를 두세요.',
  },
  {
    id: 'gender',
    title: '성별 이탈율',
    buckets: [
      { label: '남자', rate: 25.0, count: 1030 },
      { label: '여자', rate: 26.6, count: 980 },
    ],
    solution:
      '성별에 따른 이탈률 차이는 크지 않습니다(남자 25.0% vs 여자 26.6%). 성별 단독보다는 연령·고용상태 등 다른 요인과 조합해 세그먼트를 나누는 것이 더 효과적입니다.',
  },
  {
    id: 'education',
    title: '학력별 이탈율',
    buckets: [
      { label: '고졸이하', rate: 31.3, count: 326 },
      { label: '대졸이하', rate: 26.0, count: 1314 },
      { label: '대학원이상', rate: 20.1, count: 364 },
    ],
    solution:
      '학력이 낮을수록(특히 고졸 이하 31.3%) 이탈률이 높습니다. 온라인 설문·앱보다 전화·우편 등 접근성이 높은 채널과 쉬운 설명 자료를 우선 제공하세요.',
  },
  {
    id: 'religion',
    title: '종교별 이탈율',
    buckets: [
      { label: '없음', rate: 31.8, count: 927 },
      { label: '천주교', rate: 25.5, count: 247 },
      { label: '불교', rate: 20.1, count: 328 },
      { label: '기독교', rate: 19.0, count: 505 },
    ],
    solution:
      '무종교 응답자의 이탈률이 가장 높습니다(31.8%). 종교 커뮤니티를 통한 정기적 소통이 없는 만큼, 단체가 직접 뉴스레터·성과 리포트로 꾸준히 신뢰를 쌓아야 합니다.',
  },
  {
    id: 'employment',
    title: '고용 상태별 이탈율',
    buckets: [
      { label: '실업/미취업', rate: 41.8, count: 91 },
      { label: '퇴직', rate: 35.3, count: 133 },
      { label: '학생', rate: 33.6, count: 116 },
      { label: '일용근로자', rate: 33.3, count: 21 },
      { label: '주부', rate: 30.7, count: 225 },
      { label: '자영업자', rate: 30.2, count: 179 },
      { label: '임시근로자', rate: 31.5, count: 130 },
      { label: '상용근로자', rate: 20.1, count: 1119 },
    ],
    solution:
      '실업/미취업 상태의 기부자 이탈률이 가장 높습니다(41.8%). 소득이 불안정할 가능성이 크므로, 후원 금액 조정(감액·일시정지) 옵션을 선제적으로 안내해 완전 이탈 대신 관계를 유지하세요.',
  },
  {
    id: 'has_children',
    title: '자녀 유무별 이탈율',
    buckets: [
      { label: '없음', rate: 27.0, count: 805 },
      { label: '있음', rate: 25.1, count: 1209 },
    ],
    solution:
      '자녀 유무에 따른 차이는 크지 않습니다(있음 25.1% vs 없음 27.0%). 이 요인 단독보다는 연령·소득과 함께 조합해 세그먼트를 판단하는 것이 좋습니다.',
  },
  {
    id: 'income',
    title: '소득 구간별 이탈율',
    unit: '원',
    buckets: [
      { label: '200만원 미만', rate: 30.9, count: 527 },
      { label: '200~400만원', rate: 25.4, count: 425 },
      { label: '400~600만원', rate: 29.1, count: 477 },
      { label: '600~800만원', rate: 19.7, count: 284 },
      { label: '800만원 이상', rate: 17.9, count: 301 },
    ],
    solution:
      '월평균 소득이 낮은 구간(200만원 미만·400~600만원)에서 이탈률이 상대적으로 높습니다. 후원 부담을 낮춘 소액 정기 옵션이나 유연한 결제 주기를 안내하세요.',
  },
  {
    id: 'marital',
    title: '혼인 상태별 이탈율',
    buckets: [
      { label: '별거/이혼/사별', rate: 28.4, count: 109 },
      { label: '미혼', rate: 27.6, count: 707 },
      { label: '기혼', rate: 24.5, count: 1198 },
    ],
    solution:
      '별거·이혼·사별 상태의 기부자 이탈률이 가장 높습니다(28.4%). 생활 여건 변화로 후원 여력이 달라졌을 수 있으니, 부담 없는 소액 후원 전환이나 잠시 쉬어가는 옵션을 안내하세요.',
  },
]
