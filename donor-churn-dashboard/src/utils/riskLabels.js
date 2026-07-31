/** 위험도 표시용 한글 라벨 */
export function riskLabel(level) {
  if (level === 'High') return '고위험'
  if (level === 'Medium') return '주의'
  if (level === 'Low') return '안정'
  return level || '—'
}
