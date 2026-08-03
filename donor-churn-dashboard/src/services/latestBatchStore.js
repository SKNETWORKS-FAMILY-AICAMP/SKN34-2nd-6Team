/**
 * latestBatchStore — 기부자 관리(배치 스코어링) 결과를 다른 페이지(통계 및 솔루션)와
 * 공유하기 위한 저장소.
 * - 메모리(latest): 새로고침하면 사라진다. 기부자 관리 페이지 초기화, 통계 및 솔루션
 *   페이지의 자동 표시에 쓰인다.
 * - localStorage(PERSIST_KEY): 새로고침해도 남는 백업. 통계 및 솔루션 페이지의
 *   "이전 데이터 확인" 버튼에서만 명시적으로 불러온다.
 */
let latest = null
const UPDATE_EVENT = 'donor-churn:batch-updated'
const PERSIST_KEY = 'donor-churn:latest-batch-backup'

export function saveLatestBatch(batch) {
  latest = { savedAt: Date.now(), batch }
  try {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(latest))
  } catch (err) {
    console.warn('배치 결과를 로컬에 백업하지 못했습니다.', err)
  }
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
}

export function loadLatestBatch() {
  return latest
}

/** 새로고침 후에도 남아있는 마지막 백업. "이전 데이터 확인" 버튼 전용. */
export function loadPersistedBatch() {
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.batch) return null
    return parsed
  } catch {
    return null
  }
}

export function subscribeLatestBatch(callback) {
  window.addEventListener(UPDATE_EVENT, callback)
  return () => window.removeEventListener(UPDATE_EVENT, callback)
}
