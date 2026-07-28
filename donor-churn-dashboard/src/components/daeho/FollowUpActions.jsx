/**
 * FollowUpActions — 문자/이메일/일시정지 (시뮬레이션)
 */
import { Mail, MessageSquare, Pause, Play } from 'lucide-react'

export default function FollowUpActions({
  email,
  phone,
  paused,
  onSms,
  onEmail,
  onTogglePause,
}) {
  const hasPhone = Boolean(phone?.trim())
  const hasEmail = Boolean(email?.trim())

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        후속 조치
      </h3>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={!hasPhone || paused}
          onClick={onSms}
          title={
            !hasPhone
              ? '전화번호가 없어 문자를 보낼 수 없습니다.'
              : paused
                ? '일시정지 상태에서는 발송할 수 없습니다.'
                : '문자 전송 (시뮬레이션)'
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageSquare className="h-4 w-4 text-teal-600" />
          문자 전송 (시뮬레이션)
        </button>
        {!hasPhone ? (
          <p className="text-xs text-slate-400">전화번호가 없어 문자를 보낼 수 없습니다.</p>
        ) : null}

        <button
          type="button"
          disabled={!hasEmail || paused}
          onClick={onEmail}
          title={
            !hasEmail
              ? '이메일이 없어 메일을 보낼 수 없습니다.'
              : paused
                ? '일시정지 상태에서는 발송할 수 없습니다.'
                : '이메일 전송 (시뮬레이션)'
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Mail className="h-4 w-4 text-teal-600" />
          이메일 전송 (시뮬레이션)
        </button>
        {!hasEmail ? (
          <p className="text-xs text-slate-400">이메일이 없어 메일을 보낼 수 없습니다.</p>
        ) : null}

        <button
          type="button"
          onClick={onTogglePause}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
            paused
              ? 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200 hover:bg-amber-100'
              : 'bg-slate-800 text-white hover:bg-slate-900'
          }`}
        >
          {paused ? (
            <>
              <Play className="h-4 w-4" />
              일시정지 해제
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              일시 정지
            </>
          )}
        </button>
      </div>
    </div>
  )
}
