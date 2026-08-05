/**
 * RestConfirmModal — 쉬어가기 요청 확인 후 반영 (게이트 필수)
 */
import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'

const CONFIRM_METHODS = ['전화 상담', '문자 회신', '이메일 회신', '상담 메모']
const MONTH_OPTIONS = [1, 3, 6]

export default function RestConfirmModal({ open, onClose, onSubmit }) {
  const [confirmedVia, setConfirmedVia] = useState('')
  const [months, setMonths] = useState(3)
  const [note, setNote] = useState('')
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (!open) return
    setConfirmedVia('')
    setMonths(3)
    setNote('')
    setAgreed(false)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      onClose?.()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  const canSubmit = useMemo(
    () =>
      Boolean(confirmedVia) &&
      Boolean(months) &&
      note.trim().length >= 5 &&
      agreed,
    [confirmedVia, months, note, agreed],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rest-confirm-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="rest-confirm-title"
              className="text-base font-bold text-slate-900"
            >
              요청 확인 후 반영
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              후원자 본인이 요청·동의한 경우에만 잠시 쉬어가기로 기록합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="모달 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <fieldset>
            <legend className="text-[11px] font-medium text-slate-500">
              확인 방법 <span className="text-rose-500">*</span>
            </legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {CONFIRM_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setConfirmedVia(method)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    confirmedVia === method
                      ? 'bg-teal-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[11px] font-medium text-slate-500">
              기간 <span className="text-rose-500">*</span>
            </legend>
            <div className="mt-1.5 flex gap-2">
              {MONTH_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    months === m
                      ? 'bg-teal-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m}개월
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block space-y-1">
            <span className="text-[11px] font-medium text-slate-500">
              간단 메모 <span className="text-rose-500">*</span>
              <span className="ml-1 font-normal text-slate-400">(최소 5자)</span>
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="예) 경제적 사정으로 3개월 휴식 요청"
              className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>후원자 본인이 요청/동의했음을 확인했습니다.</span>
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onSubmit?.({
                confirmedVia,
                months,
                note: note.trim(),
              })
            }
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            요청 반영하기
          </button>
        </div>
      </div>
    </div>
  )
}
