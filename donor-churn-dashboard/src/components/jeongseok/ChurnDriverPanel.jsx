/**
 * ChurnDriverPanel — 이탈과 가장 상관관계 높은 컬럼(핵심 요인) 솔루션
 * 학습 원본 데이터 기준 스피어만 상관계수로 계산된 결과를 백엔드에서 받아 표시.
 * 막대 또는 목록 항목을 클릭하면 해당 요인에 맞는 솔루션이 상단에 표시된다.
 */
import { useEffect, useMemo, useState } from 'react'
import { Loader2, TrendingUp, TrendingDown, Sparkles, Lightbulb } from 'lucide-react'
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
import { getChurnDrivers } from './jeongseokApi'
import { FALLBACK_CHURN_DRIVERS } from './churnDriverData'

const POSITIVE_COLOR = '#e11d48'
const NEGATIVE_COLOR = '#0d9488'

const toPct = (v) => `${(v * 100).toFixed(1)}%`

export default function ChurnDriverPanel() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setUsingFallback(false)

    getChurnDrivers()
      .then((res) => {
        if (cancelled) return
        if (!res?.drivers?.length) throw new Error('empty drivers')
        setData(res)
        setSelectedFeature(res.drivers[0]?.feature ?? null)
      })
      .catch(() => {
        if (cancelled) return
        // 백엔드 미구현·서버 다운 시에도 화면이 동작하도록 정적 폴백
        setData(FALLBACK_CHURN_DRIVERS)
        setSelectedFeature(FALLBACK_CHURN_DRIVERS.drivers[0]?.feature ?? null)
        setUsingFallback(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const drivers = data?.drivers || []
  const selected = useMemo(
    () => drivers.find((d) => d.feature === selectedFeature) || drivers[0],
    [drivers, selectedFeature],
  )

  const chartData = drivers.map((d) => ({ ...d, absCorrelationPct: Math.abs(d.correlation) * 100 }))

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Churn Driver Analysis
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          핵심 요인 솔루션
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          학습 데이터 기준, 이탈 여부와 상관관계가 높은 항목을 찾아냅니다. 막대나 목록을 클릭하면 해당 요인의 맞춤 솔루션을 볼 수 있습니다.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          분석 중...
        </div>
      ) : null}

      {usingFallback && !loading ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          실시간 분석 API가 없어 학습 데이터 기반 요약 결과를 표시합니다.
        </p>
      ) : null}

      {!loading && selected ? (
        <>
          <section className="rounded-xl border border-teal-200 bg-teal-50/50 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-700" />
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                {selected.rank}순위 요인 · 선택한 솔루션
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <h2 className="text-xl font-bold text-slate-900">{selected.label}</h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  selected.direction === 'positive'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-teal-100 text-teal-700'
                }`}
              >
                {selected.direction === 'positive' ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                상관관계 {toPct(selected.correlation)}
              </span>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg border-2 border-teal-300 bg-white px-4 py-3 shadow-sm">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-teal-700">추천 솔루션</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">{selected.insight}</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              분석 대상 {data.n_samples}명 (이탈 {data.n_churned}명) · 상관관계는 -100%~100%
              사이 값으로, 절대값이 클수록 이탈과 관련이 깊습니다.
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              요인별 상관관계 (절대값 기준) · 막대 클릭 시 솔루션 확인
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 8, right: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={140}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(_, __, entry) => [
                      `상관관계 ${toPct(entry.payload.correlation)}`,
                      entry.payload.label,
                    ]}
                  />
                  <Bar
                    dataKey="absCorrelationPct"
                    radius={[0, 4, 4, 0]}
                    onClick={(entry) => {
                      const feature = entry?.feature ?? entry?.payload?.feature
                      if (feature) setSelectedFeature(feature)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {chartData.map((d) => (
                      <Cell
                        key={d.feature}
                        fill={d.direction === 'positive' ? POSITIVE_COLOR : NEGATIVE_COLOR}
                        fillOpacity={d.feature === selected.feature ? 1 : 0.55}
                        stroke={d.feature === selected.feature ? '#0f172a' : 'none'}
                        strokeWidth={d.feature === selected.feature ? 1.5 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: POSITIVE_COLOR }} />
                값이 높을수록 이탈 위험 증가
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: NEGATIVE_COLOR }} />
                값이 낮을수록 이탈 위험 증가
              </span>
            </p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">전체 요인 목록 · 클릭해서 솔루션 보기</h2>
            <ul className="space-y-2">
              {drivers.map((d) => {
                const isSelected = d.feature === selected.feature
                return (
                  <li key={d.feature}>
                    <button
                      type="button"
                      onClick={() => setSelectedFeature(d.feature)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        isSelected
                          ? 'border-teal-300 bg-teal-50/70 ring-1 ring-inset ring-teal-300'
                          : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {d.rank}. {d.label}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            d.direction === 'positive' ? 'text-rose-600' : 'text-teal-700'
                          }`}
                        >
                          상관관계 {toPct(d.correlation)}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="mt-2 flex items-start gap-2 rounded-lg border-2 border-teal-300 bg-white px-3 py-2 shadow-sm">
                          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          <p className="text-xs font-semibold leading-snug text-slate-900">{d.insight}</p>
                        </div>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}
