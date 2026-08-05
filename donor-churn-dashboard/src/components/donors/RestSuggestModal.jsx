/**
 * RestSuggestModal — 잠시 쉬어가기 제안 (시뮬레이션)
 */
import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'

const MONTH_OPTIONS = [1, 3, 6]

function buildDefaultMessage(name, months) {
  const who = name?.trim() ? `${name.trim()}님` : '후원자님'
  return `안녕하세요 ${who}, 최근 후원에 부담이 있으시다면 해지 대신 ${months}개월 동안 잠시 쉬어가기를 선택하실 수 있어요. 편하실 때 다시 이어가시면 됩니다.`
}

export default function RestSuggestModal({
  open,
  donorName,
  email,
  phone,
  onClose,
  onSubmit,
}) {
  const hasPhone = Boolean(phone?.trim())
  const hasEmail = Boolean(email?.trim())
  const defaultChannel = hasPhone ? '문자' : hasEmail ? '이메일' : ''

  const [channel, setChannel] = useState(defaultChannel)
  const [months, setMonths] = useState(3)
  const [message, setMessage] = useState(() =>
    buildDefaultMessage(donorName, 3),
  )

  useEffect(() => {
    if (!open) return
    const nextChannel = hasPhone ? '문자' : hasEmail ? '이메일' : ''
    setChannel(nextChannel)
    setMonths(3)
    setMessage(buildDefaultMessage(donorName, 3))
  }, [open, donorName, hasPhone, hasEmail])

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
    () => Boolean(channel) && message.trim().length > 0,
    [channel, message],
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
        aria-labelledby="rest-suggest-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="rest-suggest-title"
              className="text-base font-bold text-slate-900"
            >
              잠시 쉬어가기 제안
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              해지 대신, 후원을 잠시 멈추고 나중에 이어갈 수 있도록 제안합니다.
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
              채널
            </legend>
            <div className="mt-1.5 flex gap-2">
              <ChannelButton
                label="문자"
                active={channel === '문자'}
                disabled={!hasPhone}
                disabledHint="전화번호 없음"
                onClick={() => setChannel('문자')}
              />
              <ChannelButton
                label="이메일"
                active={channel === '이메일'}
                disabled={!hasEmail}
                disabledHint="이메일 없음"
                onClick={() => setChannel('이메일')}
              />
            </div>
            {!hasPhone && !hasEmail ? (
              <p className="mt-1.5 text-xs text-rose-600">
                연락처가 없어 제안을 보낼 수 없습니다.
              </p>
            ) : null}
          </fieldset>

          <fieldset>
            <legend className="text-[11px] font-medium text-slate-500">
              기간
            </legend>
            <div className="mt-1.5 flex gap-2">
              {MONTH_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMonths(m)
                    setMessage(buildDefaultMessage(donorName, m))
                  }}
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
              제안 메시지
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
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
            onClick={() => onSubmit?.({ channel, months, message: message.trim() })}
            className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            제안 보내기 (시뮬레이션)
          </button>
        </div>
      </div>
    </div>
  )
}

function ChannelButton({ label, active, disabled, disabledHint, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? disabledHint : undefined}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'bg-teal-600 text-white'
          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
      {disabled ? (
        <span className="ml-1 font-normal opacity-80">({disabledHint})</span>
      ) : null}
    </button>
  )
}
