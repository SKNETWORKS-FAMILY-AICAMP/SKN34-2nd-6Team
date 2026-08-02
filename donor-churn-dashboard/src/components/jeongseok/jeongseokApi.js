/**
 * jeongseokApi.js — 정석 담당 컴포넌트 전용 API 헬퍼
 * 팀 공용 src/services/api.js는 건드리지 않고, jeongseok 폴더 내부에서만 사용.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

/**
 * 이탈과 가장 상관관계 높은 컬럼(핵심 요인) 조회
 * 백엔드에 GET /api/v1/insights/churn-drivers 엔드포인트가 있어야 동작합니다.
 */
export async function getChurnDrivers() {
  const res = await fetch(`${API_BASE}/api/v1/insights/churn-drivers`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json()
}
