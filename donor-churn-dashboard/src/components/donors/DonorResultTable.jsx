/**
 * DonorResultTable — 배치 예측 결과 리스트 (이탈확률 내림차순)
 */
import Badge from '../common/Badge'
import { riskLabel } from '../../utils/riskLabels'

export default function DonorResultTable({
  rows,
  restingIds,
  selectedRowIndex,
  onSelect,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs tracking-wide text-slate-400">
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">번호</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">이름</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">
              이탈 가능성
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">위험도</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">
              추천 연락 경로
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">
              이메일
            </th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">
              전화번호
            </th>
            <th className="min-w-[280px] px-3 py-2.5 font-medium">
              다음 조치
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const resting = restingIds?.has(r.row_index)
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
                <td className="whitespace-nowrap px-3 py-3 text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    {r.row_index}
                    {resting ? (
                      <Badge variant="warning">잠시 쉬어가는 중</Badge>
                    ) : null}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-800">
                  {r.name || '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-semibold tabular-nums text-slate-900">
                  {r.probability_pct}%
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <Badge
                    variant={
                      r.risk_level === 'High'
                        ? 'danger'
                        : r.risk_level === 'Medium'
                          ? 'warning'
                          : 'success'
                    }
                  >
                    {riskLabel(r.risk_level)}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                  {r.recommended_channel}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                  {r.email || '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-600">
                  {r.phone || '—'}
                </td>
                <td className="min-w-[280px] max-w-md px-3 py-3 text-xs leading-relaxed break-keep text-slate-600">
                  {r.next_step}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {!rows.length ? (
        <p className="py-8 text-center text-sm text-slate-400">
          표시할 결과가 없습니다.
        </p>
      ) : null}
    </div>
  )
}
