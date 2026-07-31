/**
 * SolutionSegmentCard — 위험도 1개 세그먼트(High/Medium/Low) 카드
 * 채널 분포 요약 + 개별 기부자별 다음 액션 리스트
 */
import { AlertTriangle, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react'

const LEVEL_CONFIG = {
  High: {
    label: '고위험',
    icon: AlertTriangle,
    accent: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200',
    header: 'bg-rose-50/60',
    count: 'text-rose-600',
    solutionBox: 'border-rose-200 bg-rose-50',
    solutionIcon: 'text-rose-600',
    solutionText: 'text-rose-900',
  },
  Medium: {
    label: '중위험',
    icon: AlertCircle,
    accent: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200',
    header: 'bg-amber-50/60',
    count: 'text-amber-600',
    solutionBox: 'border-amber-200 bg-amber-50',
    solutionIcon: 'text-amber-600',
    solutionText: 'text-amber-900',
  },
  Low: {
    label: '저위험',
    icon: CheckCircle2,
    accent: 'bg-teal-500',
    badge: 'bg-teal-100 text-teal-700 ring-1 ring-inset ring-teal-200',
    header: 'bg-teal-50/60',
    count: 'text-teal-700',
    solutionBox: 'border-teal-200 bg-teal-50',
    solutionIcon: 'text-teal-600',
    solutionText: 'text-teal-900',
  },
}

export default function SolutionSegmentCard({ level, rows }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.Low
  const Icon = cfg.icon

  const channelCounts = rows.reduce((acc, r) => {
    const key = r.recommended_channel || '미지정'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const topChannel = Object.entries(channelCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 w-full ${cfg.accent}`} />
      <div className={`flex items-center justify-between gap-2 px-5 py-4 ${cfg.header}`}>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${cfg.badge}`}>
          <Icon className="h-4 w-4" />
          {cfg.label}
        </span>
        <span className={`text-2xl font-extrabold ${cfg.count}`}>{rows.length}</span>
      </div>

      <div className="px-5 pt-3">
        {topChannel ? (
          <p className="text-xs text-slate-500">
            권장 채널 1순위: <span className="font-semibold text-slate-700">{topChannel}</span>
          </p>
        ) : null}

        <ul className="mt-3 max-h-80 space-y-2.5 overflow-y-auto pb-4 pr-1">
          {rows.slice(0, 20).map((r) => {
            const contact = r.email || r.phone || null
            return (
              <li
                key={r.row_index}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-medium text-slate-400"
                    title="업로드한 원본 CSV/Excel 파일에서 이 기부자가 있는 행 번호입니다. 원본 파일에서 해당 줄을 찾아 전체 정보를 확인하세요."
                  >
                    원본 파일 {r.row_index}행에 있는 기부자
                  </span>
                  <span className="text-xs font-semibold text-teal-700">
                    이탈확률 {(r.probability_pct ?? r.probability * 100).toFixed(1)}%
                  </span>
                </div>
                {contact ? (
                  <p className="mt-1 truncate text-xs text-slate-600">{contact}</p>
                ) : null}
                <p className="mt-1.5 text-xs text-slate-500">
                  권장 채널: <span className="font-semibold text-slate-700">{r.recommended_channel || '—'}</span>
                </p>
                <div
                  className={`mt-2 flex items-start gap-1.5 rounded-lg border px-2.5 py-2 ${cfg.solutionBox}`}
                >
                  <Lightbulb className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${cfg.solutionIcon}`} />
                  <p className={`text-xs font-semibold leading-snug ${cfg.solutionText}`}>
                    {r.next_step}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
        {rows.length > 20 ? (
          <p className="pb-4 text-xs text-slate-400">외 {rows.length - 20}명 더 있음</p>
        ) : null}
      </div>
    </div>
  )
}
