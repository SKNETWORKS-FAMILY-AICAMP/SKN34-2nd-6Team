/**
 * liveChurnStats.js — 기부자 관리 페이지의 배치 예측 결과(profile + probability)를
 * demographicChurnData.js 와 같은 8개 컬럼 구조로 집계한다.
 * rate = 해당 구간 표본의 평균 예측 이탈 확률(%) — 실제 관측 이탈률이 아니라 모델 예측치다.
 * 종교(religion)는 배치 응답의 profile에 포함되지 않아(백엔드 PROFILE_USER_KEYS 미포함)
 * 집계할 수 없으므로 해당 컬럼만 학습 원본 데이터 참고값(reference)으로 대체한다.
 */
import { DEMOGRAPHIC_CHURN } from './demographicChurnData'

function bucketAge(age) {
  if (!Number.isFinite(age)) return null
  if (age <= 29) return '29세 이하'
  if (age <= 39) return '30대'
  if (age <= 49) return '40대'
  if (age <= 59) return '50대'
  if (age <= 69) return '60대'
  return '70세 이상'
}

function bucketGender(v) {
  if (v === 1) return '남자'
  if (v === 2) return '여자'
  return null
}

function bucketEducation(v) {
  if (v === 1 || v === 2 || v === 3) return '고졸이하'
  if (v === 4) return '대졸이하'
  if (v === 5) return '대학원이상'
  return null
}

const EMPLOYMENT_LABEL = {
  1: '상용근로자',
  2: '임시근로자',
  3: '일용근로자',
  4: '자영업자',
  5: '학생',
  6: '주부',
  7: '실업/미취업',
  8: '퇴직',
}

const MARITAL_LABEL = {
  1: '미혼',
  2: '기혼',
  3: '별거/이혼/사별',
}

function bucketHasChildren(v) {
  if (v === 1) return '있음'
  if (v === 2) return '없음'
  return null
}

function bucketIncome(v) {
  if (!Number.isFinite(v)) return null
  if (v < 2_000_000) return '200만원 미만'
  if (v < 4_000_000) return '200~400만원'
  if (v < 6_000_000) return '400~600만원'
  if (v < 8_000_000) return '600~800만원'
  return '800만원 이상'
}

/** dim.id → profile에서 값을 읽어 정적 데이터와 같은 구간 라벨로 변환하는 함수 */
const DIMENSION_BUCKETERS = {
  age: (p) => bucketAge(Number(p['연령'])),
  gender: (p) => bucketGender(Number(p['성별'])),
  education: (p) => bucketEducation(Number(p['최종 학력'])),
  employment: (p) => EMPLOYMENT_LABEL[Number(p['고용 상태'])] || null,
  has_children: (p) => bucketHasChildren(Number(p['자녀 유무'])),
  income: (p) => bucketIncome(Number(p['월평균 가구소득 (원, 세전)'])),
  marital: (p) => MARITAL_LABEL[Number(p['혼인 상태'])] || null,
}

/**
 * @param {Array<{probability_pct:number, profile?:Record<string, unknown>}>} rows 배치 결과(스코어링된 행만)
 * @returns {Array|null} DEMOGRAPHIC_CHURN과 같은 구조(각 dim에 isReference 플래그 추가). rows가 비어 있으면 null.
 */
export function computeLiveDemographicChurn(rows) {
  const scored = (rows || []).filter(
    (r) => r?.probability_pct != null && r.profile && typeof r.profile === 'object',
  )
  if (!scored.length) return null

  return DEMOGRAPHIC_CHURN.map((dim) => {
    const bucketer = DIMENSION_BUCKETERS[dim.id]
    if (!bucketer) {
      // 예: 종교 — 업로드 자료에 해당 항목이 없어 학습 원본 데이터로 대체
      return { ...dim, isReference: true }
    }

    const groups = new Map()
    for (const row of scored) {
      const label = bucketer(row.profile)
      if (!label) continue
      const g = groups.get(label) || { sum: 0, count: 0 }
      g.sum += Number(row.probability_pct)
      g.count += 1
      groups.set(label, g)
    }
    if (!groups.size) return { ...dim, isReference: true }

    const solutionByLabel = new Map(dim.buckets.map((b) => [b.label, b.solution]))
    const order = dim.buckets.map((b) => b.label)
    const buckets = Array.from(groups.entries())
      .map(([label, g]) => ({
        label,
        rate: Math.round((g.sum / g.count) * 10) / 10,
        count: g.count,
        solution: solutionByLabel.get(label) || dim.solution,
      }))
      .sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))

    return { ...dim, buckets, isReference: false }
  })
}
