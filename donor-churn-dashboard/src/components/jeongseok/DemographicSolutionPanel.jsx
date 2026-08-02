/**
 * DemographicSolutionPanel — 인구통계별(연령대/성별/학력/종교/고용상태/자녀유무/소득구간/혼인상태) 이탈율 + 솔루션
 * 시각화 페이지(호순 담당)와 같은 8개 축을 기준으로, 정석 담당 폴더에서 실제 데이터 기반 솔루션을 제시.
 * 정적 데이터(demographicChurnData.js)만 사용하며 백엔드 API를 호출하지 않음.
 * 막대(이탈율)를 클릭하면 화면이 어두워지며 해당 솔루션이 모달로 표시된다.
 */
import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Lightbulb, X } from 'lucide-react'
import { DEMOGRAPHIC_CHURN } from './demographicChurnData'

const HIGH_COLOR = '#e11d48'
const NORMAL_COLOR = '#94a3b8'

export default function DemographicSolutionPanel() {
  const [modal, setModal] = useState(null) // { dim, bucket } | null

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Demographic Churn Solutions
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          인구통계별 솔루션
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          시각화 페이지와 같은 8개 항목(연령대·성별·학력·종교·고용상태·자녀유무·소득구간·혼인상태) 기준
          실제 이탈율 데이터를 보여줍니다. 막대를 클릭하면 해당 구간의 솔루션을 볼 수 있습니다.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {DEMOGRAPHIC_CHURN.map((dim) => {
          const maxRate = Math.max(...dim.buckets.map((b) => b.rate))
          return (
            <section
              key={dim.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-sm font-semibold text-slate-900">{dim.title}</h2>

              <div className="mt-3" style={{ height: Math.max(140, dim.buckets.length * 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dim.buckets}
                    layout="vertical"
                    margin={{ left: 8, right: 28 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      domain={[0, Math.max(50, Math.ceil((maxRate + 10) / 10) * 10)]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={90}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(_, __, entry) => [
                        `이탈율 ${entry.payload.rate}% (표본 ${entry.payload.count}명)`,
                        entry.payload.label,
                      ]}
                    />
                    <Bar
                      dataKey="rate"
                      radius={[0, 4, 4, 0]}
                      onClick={(bucket) => setModal({ dim, bucket })}
                      style={{ cursor: 'pointer' }}
                    >
                      {dim.buckets.map((b) => (
                        <Cell
                          key={b.label}
                          fill={b.rate === maxRate ? HIGH_COLOR : NORMAL_COLOR}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )
        })}
      </div>

      <p className="text-xs text-slate-400">
        * 표본 20명 미만인 세부 구간(예: 초졸이하, 원불교 등)은 신뢰도가 낮아 제외했습니다. 이탈율은
        학습 원본 데이터(2,014명) 전수 분석 기준입니다.
      </p>

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                  {modal.dim.title}
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {modal.bucket.label}
                  <span className="ml-2 text-base font-semibold text-rose-600">
                    이탈율 {modal.bucket.rate}%
                  </span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">표본 {modal.bucket.count}명</p>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg border-2 border-teal-300 bg-teal-50/60 px-4 py-3">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700">
                  추천 솔루션
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">
                  {modal.dim.solution}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
