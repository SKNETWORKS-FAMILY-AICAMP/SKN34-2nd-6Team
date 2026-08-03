/**
 * api.js — FastAPI 연동 (배치 스코어링)
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }

  return res.json()
}

/**
 * CSV/Excel 배치 스코어링
 * @param {File} file
 */
export async function predictBatch(file) {
  const form = new FormData()
  form.append('file', file)
  return request('/api/v1/predict/batch', {
    method: 'POST',
    body: form,
  })
}

export function templateDownloadUrl() {
  return `${API_BASE}/api/v1/template/csv`
}

/**
 * Bedrock 개인화 SMS/이메일 초안
 * @param {{
 *   donor_name?: string,
 *   probability_pct: number,
 *   risk_level: string,
 *   recommended_channel: string,
 *   next_step: string,
 *   profile?: Record<string, unknown>,
 * }} payload
 */
export async function generateCopyDraft(payload) {
  return request('/api/v1/copy/draft', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
