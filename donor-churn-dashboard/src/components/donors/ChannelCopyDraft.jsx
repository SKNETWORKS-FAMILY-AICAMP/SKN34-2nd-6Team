/**
 * ChannelCopyDraft — 채널별(SMS | 이메일) AI 초안 패널
 */
import { Loader2, RefreshCw, Send, X } from 'lucide-react'

export default function ChannelCopyDraft({
  channel,
  draft,
  loading,
  error,
  onChange,
  onSend,
  onClose,
  onRegenerate,
}) {
  if (!channel) return null

  const isSms = channel === 'sms'
  const canSend = isSms
    ? Boolean(draft?.sms?.trim())
    : Boolean(draft?.email_subject?.trim() || draft?.email_body?.trim())

  return (
    <div className="space-y-3 rounded-lg border border-teal-100 bg-teal-50/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-teal-800">
          {isSms ? 'AI 문자 초안' : 'AI 이메일 초안'}
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-700"
          aria-label="초안 닫기"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
          초안을 만들고 있어요…
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}

      {!loading && draft ? (
        <>
          {draft.rationale ? (
            <p className="text-xs leading-relaxed text-teal-900/80">
              {draft.rationale}
            </p>
          ) : null}

          {isSms ? (
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-slate-500">SMS</span>
              <textarea
                value={draft.sms || ''}
                onChange={(e) =>
                  onChange?.({ ...draft, sms: e.target.value })
                }
                rows={3}
                className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <span className="text-[10px] text-slate-400">
                {(draft.sms || '').length}자
              </span>
            </label>
          ) : (
            <>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-500">
                  이메일 제목
                </span>
                <input
                  type="text"
                  value={draft.email_subject || ''}
                  onChange={(e) =>
                    onChange?.({ ...draft, email_subject: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-medium text-slate-500">
                  이메일 본문
                </span>
                <textarea
                  value={draft.email_body || ''}
                  onChange={(e) =>
                    onChange?.({ ...draft, email_body: e.target.value })
                  }
                  rows={5}
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>
            </>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              다시 만들기
            </button>
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend || loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              보내기 (시뮬레이션)
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}
