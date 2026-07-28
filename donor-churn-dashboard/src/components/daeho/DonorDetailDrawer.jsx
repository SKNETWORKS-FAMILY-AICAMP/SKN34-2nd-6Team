/**
 * DonorDetailDrawer — 오른쪽 슬라이드 상세 정보
 */
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Badge from '../common/Badge'
import FollowUpActions from './FollowUpActions'
import { generateCopyDraft } from '../../services/api'

export default function DonorDetailDrawer({
  open,
  row,
  resting,
  suggested,
  actionLogs,
  onClose,
  onSendSms,
  onSendEmail,
  onSuggestRest,
  onConfirmRest,
  onResume,
}) {
  const [draftChannel, setDraftChannel] = useState(null)
  const [draft, setDraft] = useState(null)
  const [draftLoading, setDraftLoading] = useState(false)
  const [draftError, setDraftError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  useEffect(() => {
    setDraftChannel(null)
    setDraft(null)
    setDraftLoading(false)
    setDraftError('')
  }, [row?.row_index])

  useEffect(() => {
    if (resting) {
      setDraftChannel(null)
      setDraft(null)
      setDraftLoading(false)
      setDraftError('')
    }
  }, [resting])

  const fetchDraft = async (channel) => {
    if (!row || resting) return
    setDraftChannel(channel)
    setDraft(null)
    setDraftLoading(true)
    setDraftError('')
    try {
      const result = await generateCopyDraft({
        donor_name: row.name || '',
        probability_pct: row.probability_pct,
        risk_level: row.risk_level,
        recommended_channel: row.recommended_channel,
        next_step: row.next_step,
        profile: row.profile || {},
      })
      setDraft(result)
    } catch (err) {
      setDraftError(
        String(err?.message || '').includes('503')
          ? 'AI 초안 서버(Bedrock)에 연결하지 못했습니다. AWS 설정·API 상태를 확인해 주세요.'
          : 'AI 초안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setDraftLoading(false)
    }
  }

  const handleCloseDraft = () => {
    setDraftChannel(null)
    setDraft(null)
    setDraftError('')
    setDraftLoading(false)
  }

  const handleSendDraft = () => {
    if (!draftChannel || !draft) return
    if (draftChannel === 'sms') {
      onSendSms?.(draft)
    } else {
      onSendEmail?.(draft)
    }
    handleCloseDraft()
  }

  if (!open || !row) return null

  const profileEntries = Object.entries(row.profile || {})

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-slate-900/40 transition"
        onClick={onClose}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl animate-in slide-in-from-right"
        style={{ animation: 'donor-drawer-in 200ms ease-out' }}
      >
        <style>{`
          @keyframes donor-drawer-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              Donor Detail
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {row.name?.trim() ? row.name : `행 #${row.row_index}`}
            </h2>
            {row.name?.trim() ? (
              <p className="text-xs text-slate-400">행 #{row.row_index}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge
                variant={
                  row.risk_level === 'High'
                    ? 'danger'
                    : row.risk_level === 'Medium'
                      ? 'warning'
                      : 'success'
                }
              >
                {row.risk_level}
              </Badge>
              {resting ? (
                <Badge variant="warning">잠시 쉬어가는 중</Badge>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="상세 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-[11px] text-slate-400">이탈 확률</dt>
              <dd className="mt-0.5 text-lg font-bold text-slate-900">
                {row.probability_pct}%
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-[11px] text-slate-400">권장 채널</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                {row.recommended_channel}
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Next Step
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {row.next_step}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              연락처
            </h3>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between gap-3 border-b border-slate-50 pb-2">
                <dt className="text-slate-400">이름</dt>
                <dd className="font-medium text-slate-800">
                  {row.name || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-slate-50 pb-2">
                <dt className="text-slate-400">이메일</dt>
                <dd className="font-medium text-slate-800">
                  {row.email || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-slate-50 pb-2">
                <dt className="text-slate-400">전화번호</dt>
                <dd className="font-medium text-slate-800">
                  {row.phone || '—'}
                </dd>
              </div>
            </dl>
          </div>

          {profileEntries.length ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                프로필 요약
              </h3>
              <dl className="mt-2 space-y-2 text-sm">
                {profileEntries.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-3 border-b border-slate-50 pb-2"
                  >
                    <dt className="text-slate-400">{label}</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {typeof value === 'number'
                        ? value.toLocaleString('ko-KR')
                        : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <FollowUpActions
            email={row.email}
            phone={row.phone}
            resting={resting}
            suggested={suggested}
            draftChannel={draftChannel}
            draft={draft}
            draftLoading={draftLoading}
            draftError={draftError}
            onCreateSmsDraft={() => fetchDraft('sms')}
            onCreateEmailDraft={() => fetchDraft('email')}
            onDraftChange={setDraft}
            onSendDraft={handleSendDraft}
            onCloseDraft={handleCloseDraft}
            onRegenerateDraft={() => draftChannel && fetchDraft(draftChannel)}
            onSuggestRest={onSuggestRest}
            onConfirmRest={onConfirmRest}
            onResume={onResume}
          />

          {actionLogs?.length ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                최근 조치
              </h3>
              <ul className="mt-2 space-y-1.5">
                {actionLogs.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600"
                  >
                    <span className="font-medium text-slate-800">{log.label}</span>
                    <span className="ml-2 text-slate-400">{log.at}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
