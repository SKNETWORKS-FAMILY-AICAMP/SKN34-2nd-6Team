/**
 * FollowUpActions — 메시지(AI 초안) + 잠시 쉬어가기 (시뮬레이션)
 */
import { Mail, MessageSquare, Coffee, Play, ClipboardCheck, Loader2, Sparkles } from 'lucide-react'
import ChannelCopyDraft from './ChannelCopyDraft'

export default function FollowUpActions({
  email,
  phone,
  resting,
  suggested,
  draftChannel,
  draft,
  draftLoading,
  draftError,
  onCreateSmsDraft,
  onCreateEmailDraft,
  onDraftChange,
  onSendDraft,
  onCloseDraft,
  onRegenerateDraft,
  onSuggestRest,
  onConfirmRest,
  onResume,
}) {
  const hasPhone = Boolean(phone?.trim())
  const hasEmail = Boolean(email?.trim())

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          메시지
        </h3>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={!hasPhone || resting || draftLoading}
            onClick={onCreateSmsDraft}
            title={
              !hasPhone
                ? '전화번호가 없어 문자를 보낼 수 없습니다.'
                : resting
                  ? '잠시 쉬어가는 중에는 독촉성 메시지를 보내지 않습니다.'
                  : 'AI 문자 초안 만들기'
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {draftLoading && draftChannel === 'sms' ? (
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-teal-600" />
                <Sparkles className="h-3.5 w-3.5 text-teal-500" />
              </span>
            )}
            AI 문자 초안 만들기
          </button>
          {!hasPhone ? (
            <p className="text-xs text-slate-400">
              전화번호가 없어 문자를 보낼 수 없습니다.
            </p>
          ) : null}

          <button
            type="button"
            disabled={!hasEmail || resting || draftLoading}
            onClick={onCreateEmailDraft}
            title={
              !hasEmail
                ? '이메일이 없어 메일을 보낼 수 없습니다.'
                : resting
                  ? '잠시 쉬어가는 중에는 독촉성 메시지를 보내지 않습니다.'
                  : 'AI 이메일 초안 만들기'
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {draftLoading && draftChannel === 'email' ? (
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-teal-600" />
                <Sparkles className="h-3.5 w-3.5 text-teal-500" />
              </span>
            )}
            AI 이메일 초안 만들기
          </button>
          {!hasEmail ? (
            <p className="text-xs text-slate-400">
              이메일이 없어 메일을 보낼 수 없습니다.
            </p>
          ) : null}

          {resting ? (
            <p className="text-xs leading-relaxed text-amber-700">
              잠시 쉬어가는 중에는 독촉성 메시지를 보내지 않습니다.
            </p>
          ) : null}

          {!resting && draftChannel ? (
            <ChannelCopyDraft
              channel={draftChannel}
              draft={draft}
              loading={draftLoading}
              error={draftError}
              onChange={onDraftChange}
              onSend={onSendDraft}
              onClose={onCloseDraft}
              onRegenerate={onRegenerateDraft}
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          잠시 쉬어가기
        </h3>
        <p className="text-xs leading-relaxed text-slate-500">
          해지 대신, 후원자 요청·동의 확인 후에만 잠시 쉬어가기로 기록합니다.
        </p>
        <div className="flex flex-col gap-2">
          {resting ? (
            <button
              type="button"
              onClick={onResume}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-800 ring-1 ring-inset ring-amber-200 hover:bg-amber-100"
            >
              <Play className="h-4 w-4" />
              다시 시작하기
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onSuggestRest}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Coffee className="h-4 w-4 text-teal-600" />
                {suggested ? '쉬어가기 다시 제안하기' : '쉬어가기 제안하기'}
              </button>
              {suggested ? (
                <p className="text-xs text-teal-700">
                  이미 쉬어가기 제안을 보냈습니다.
                </p>
              ) : null}
              <button
                type="button"
                onClick={onConfirmRest}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
              >
                <ClipboardCheck className="h-4 w-4" />
                요청 확인 후 반영
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
