const probabilities = [
  0.22, 0.31, 0.43, 0.57, 0.68, 0.72, 0.49, 0.55,
  0.61, 0.39, 0.27, 0.81, 0.46, 0.52, 0.64, 0.74,
  0.35, 0.58, 0.41, 0.69, 0.33, 0.77, 0.48, 0.6,
]

const ages = [
  24, 27, 31, 34, 38, 42, 45, 48,
  51, 54, 57, 61, 64, 67, 29, 36,
  43, 52, 59, 63, 32, 47, 56, 71,
]

const religions = [1, 2, 3, 4, 9997, 9998]

function riskLevel(probability) {
  if (probability >= 0.55) return 'High'
  if (probability >= 0.35) return 'Medium'
  return 'Low'
}

const results = probabilities.map((probability, index) => ({
  row_index: index + 1,
  probability,
  probability_pct: Number((probability * 100).toFixed(1)),
  risk_level: riskLevel(probability),
  recommended_channel: '예시 데이터',
  next_step: '예시 데이터 기반 시각화 행입니다.',
  email: '',
  phone: '',
  profile: {
    연령: ages[index],
    성별: index % 12 === 11 ? 3 : (index % 2) + 1,
    '최종 학력': (index % 5) + 1,
    종교: religions[index % religions.length],
    '고용 상태': (index % 8) + 1,
    '자녀 유무': (index % 2) + 1,
    '월평균 가구소득 (원, 세전)': 1_600_000 + (index % 8) * 1_050_000,
    '혼인 상태': (index % 3) + 1,
  },
}))

const churnCount = results.filter((row) => row.probability >= 0.55).length

export const SAMPLE_CHURN_BATCH = {
  model_name: '예시 이탈 예측 데이터',
  threshold: 0.55,
  n_total: results.length,
  n_scored: results.length,
  n_high_risk: churnCount,
  channel_distribution: [],
  results,
}
