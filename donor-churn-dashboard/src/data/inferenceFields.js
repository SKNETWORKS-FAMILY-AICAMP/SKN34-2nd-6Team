/**
 * 추론/배치 템플릿 — 학습 모델(XGBoost_model_v1, 27 features) 원본 입력에 맞춤 (전략 A)
 * 백엔드 column_map.py 와 동기화
 */
export const CHANNEL_OPTIONS = [
  { value: 1, label: '방송(TV/라디오)' },
  { value: 2, label: '신문/잡지' },
  { value: 3, label: '온라인 기사/광고' },
  { value: 4, label: '거리모금' },
  { value: 5, label: '포털 기부플랫폼' },
  { value: 6, label: '지인 추천' },
  { value: 7, label: '단체 직접 제공(메일/전화)' },
  { value: 8, label: '단체 행사' },
  { value: 9, label: 'SNS/유튜브' },
  { value: 10, label: '인터넷 검색' },
  { value: 11, label: '블록체인 모금앱' },
  { value: 12, label: '직장 사회공헌' },
]

export const inferenceFieldMeta = {
  has_children: {
    label: '자녀 유무',
    options: [
      { value: 1, label: '예' },
      { value: 2, label: '아니오' },
    ],
    default: 1,
  },
  age: { label: '연령', min: 18, max: 80, default: 45 },
  marital: {
    label: '혼인 상태',
    options: [
      { value: 1, label: '미혼' },
      { value: 2, label: '기혼' },
      { value: 3, label: '별거/이혼/사별' },
    ],
    default: 2,
  },
  gender: {
    label: '성별',
    options: [
      { value: 1, label: '남자' },
      { value: 2, label: '여자' },
    ],
    default: 1,
  },
  region_group: {
    label: '거주 지역',
    options: [
      { value: 1, label: '서울특별시' },
      { value: 2, label: '경기/인천' },
      { value: 3, label: '대전/세종/충청' },
      { value: 4, label: '광주/전라' },
      { value: 5, label: '대구/경북' },
      { value: 6, label: '부산/경남/울산' },
      { value: 7, label: '강원/제주' },
    ],
    default: 2,
  },
  household_size: {
    label: '가구원 수 (본인 포함)',
    min: 1,
    max: 20,
    default: 3,
  },
  religion: {
    label: '종교',
    options: [
      { value: 1, label: '기독교' },
      { value: 2, label: '불교' },
      { value: 3, label: '천주교' },
      { value: 4, label: '원불교' },
      { value: 9997, label: '기타' },
      { value: 9998, label: '없음' },
    ],
    default: 9998,
  },
  employment: {
    label: '고용 상태',
    options: [
      { value: 1, label: '상용근로자' },
      { value: 2, label: '임시근로자' },
      { value: 3, label: '일용근로자' },
      { value: 4, label: '자영업자' },
      { value: 5, label: '학생' },
      { value: 6, label: '주부' },
      { value: 7, label: '실업/미취업' },
      { value: 8, label: '퇴직' },
    ],
    default: 1,
  },
  income: {
    label: '월평균 가구소득 (원, 세전)',
    min: 0,
    max: 100000000,
    default: 4000000,
  },
  income_change: {
    label: '전년 대비 소득 변화',
    options: [
      { value: 1, label: '줄었다' },
      { value: 2, label: '변화 없음' },
      { value: 3, label: '늘었다' },
    ],
    default: 2,
  },
  education: {
    label: '최종 학력',
    options: [
      { value: 1, label: '초졸 이하' },
      { value: 2, label: '중졸 이하' },
      { value: 3, label: '고졸 이하' },
      { value: 4, label: '대졸 이하' },
      { value: 5, label: '대학원 이상' },
    ],
    default: 4,
  },
  channel_1: { label: '습득경로_방송', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_2: { label: '습득경로_신문잡지', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_3: { label: '습득경로_온라인기사', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_4: { label: '습득경로_거리모금', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_5: { label: '습득경로_포털', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_6: { label: '습득경로_지인추천', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_7: { label: '습득경로_단체직접', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 1 },
  channel_8: { label: '습득경로_단체행사', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_9: { label: '습득경로_SNS', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_10: { label: '습득경로_인터넷검색', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_11: { label: '습득경로_블록체인', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  channel_12: { label: '습득경로_직장공헌', options: [{ value: 0, label: '아니오' }, { value: 1, label: '예' }], default: 0 },
  org_criteria: {
    label: '단체 선택 시 가장 중요한 기준',
    options: [
      { value: 1, label: '인지도' },
      { value: 2, label: '투명성·신뢰성' },
      { value: 3, label: '지인 소개/권유' },
      { value: 4, label: '활동 분야·수혜자 관심' },
      { value: 5, label: '직접 홍보/요청' },
    ],
    default: 2,
  },
  info_channel: {
    label: '기부정보 습득경로(주경로)',
    options: CHANNEL_OPTIONS,
    default: 7,
  },
  donate_intent: {
    label: '올해 금전 기부 의향',
    options: [
      { value: 1, label: '예' },
      { value: 2, label: '아니오' },
    ],
    default: 1,
  },
  know_hometown_giving: {
    label: '고향사랑기부제 인지 여부',
    options: [
      { value: 1, label: '예' },
      { value: 2, label: '아니오' },
    ],
    default: 1,
  },
}

export const REQUIRED_BATCH_COLUMNS = Object.entries(inferenceFieldMeta).map(
  ([key, meta]) => ({ key, label: meta.label }),
)
