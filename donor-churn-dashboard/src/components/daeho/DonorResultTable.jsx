/**
 * DonorResultTable — 배치 예측 결과 리스트 (이탈확률 내림차순)
 */
import Badge from '../common/Badge'

export default function DonorResultTable({
  rows,
  pausedIds,
  selectedRowIndex,
  onSelect,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-2 py-2 font-medium">#</th>
            <th className="px-2 py-2 font-medium">이탈확률</th>
            <th className="px-2 py-2 font-medium">위험</th>
            <th className="px-2 py-2 font-medium">권장 채널</th>
            <th className="px-2 py-2 font-medium">이메일</th>
            <th className="px-2 py-2 font-medium">전화번호</th>
            <th className="px-2 py-2 font-medium">Next Step</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const paused = pausedIds?.has(r.row_index)
            const selected = selectedRowIndex === r.row_index
            return (
              <tr
                key={`${r.row_index}-${i}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelect?.(r)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect?.(r)
                  }
                }}
                className={`cursor-pointer border-b border-slate-50 transition hover:bg-teal-50/50 ${
                  selected ? 'bg-teal-50/70' : ''
                }`}
              >
                <td className="px-2 py-2.5 text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    {r.row_index}
                    {paused ? (
                      <Badge variant="warning">일시정지</Badge>
                    ) : null}
                  </span>
                </td>
                <td className="px-2 py-2.5 font-semibold text-slate-900">
                  {r.probability_pct}%
                </td>
                <td className="px-2 py-2.5">
                  <Badge
                    variant={
                      r.risk_level === 'High'
                        ? 'danger'
                        : r.risk_level === 'Medium'
                          ? 'warning'
                          : 'success'
                    }
                  >
                    {r.risk_level}
                  </Badge>
                </td>
                <td className="px-2 py-2.5 text-slate-700">
                  {r.recommended_channel}
                </td>
                <td className="px-2 py-2.5 text-slate-600">
                  {r.email || '—'}
                </td>
                <td className="px-2 py-2.5 text-slate-600">
                  {r.phone || '—'}
                </td>
                <td className="max-w-xs px-2 py-2.5 text-xs leading-relaxed text-slate-600">
                  {r.next_step}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {!rows.length ? (
        <p className="py-8 text-center text-sm text-slate-400">
          표시할 행이 없습니다.
        </p>
      ) : null}
    </div>
  )
}
