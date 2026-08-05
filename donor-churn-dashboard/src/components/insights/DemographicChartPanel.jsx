/**
 * DemographicChartPanel — 시각화 패널: 인구통계 8개 컬럼 중 선택한 하나의 이탈율을
 * 도넛형 원형 그래프(바깥쪽 라벨 + 가운데 요약)로 크게 보여준다.
 * 상단 메뉴에서 컬럼을 클릭하면 해당 컬럼의 그래프로 전환된다.
 * 그래프 카드를 클릭하면 onSelect(dim.id)로 부모에 알려 솔루션 모달을 띄운다.
 */
import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import FullReportPdfButton from './FullReportPdfButton'
import { DEMOGRAPHIC_CHURN } from './demographicChurnData'

const HIGH_COLOR = '#e11d48'
const NORMAL_COLOR = '#0d9488'

const RADIAN = Math.PI / 180

function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 10}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  )
}

function renderOuterLabel({ cx, cy, midAngle, outerRadius, payload }) {
  const radius = outerRadius + 18
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="#334155"
      fontSize={11}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${payload.label} ${payload.rate}%`}
    </text>
  )
}

export default function DemographicChartPanel({
  selectedId,
  onSelect,
  data = DEMOGRAPHIC_CHURN,
  isLive = false,
  showPdfButton = true,
}) {
  const [activeId, setActiveId] = useState(data[0].id)
  const [hoverIndex, setHoverIndex] = useState(null)
  const active = data.find((dim) => dim.id === activeId) || data[0]
  const maxRate = Math.max(...active.buckets.map((b) => b.rate))
  const maxBucket = active.buckets.find((b) => b.rate === maxRate)
  const normalCount = active.buckets.filter((b) => b.rate !== maxRate).length
  let normalIdx = 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <nav className="flex flex-wrap gap-1.5" aria-label="컬럼 선택">
          {data.map((dim) => (
            <button
              key={dim.id}
              type="button"
              onClick={() => {
                setActiveId(dim.id)
                setHoverIndex(null)
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                dim.id === activeId
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {dim.title.replace('별 이탈율', '')}
            </button>
          ))}
        </nav>
        {showPdfButton ? <FullReportPdfButton data={data} /> : null}
      </div>

      <section
        role="button"
        tabIndex={0}
        onClick={() => onSelect(activeId)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(activeId)
        }}
        className={`cursor-pointer rounded-xl border bg-white p-6 shadow-sm transition ${
          activeId === selectedId
            ? 'border-teal-300 ring-1 ring-inset ring-teal-300'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">{active.title}</h2>
          {isLive && active.isReference ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-slate-400">그래프를 클릭하면 솔루션을 볼 수 있습니다</p>

        <div className="relative mt-2" style={{ height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={active.buckets}
                dataKey="rate"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                paddingAngle={1.5}
                labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                label={renderOuterLabel}
                activeIndex={hoverIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {active.buckets.map((b) => {
                  const isMax = b.rate === maxRate
                  const opacity = isMax ? 1 : 0.35 + (normalIdx++ / Math.max(1, normalCount - 1)) * 0.5
                  return (
                    <Cell
                      key={b.label}
                      fill={isMax ? HIGH_COLOR : NORMAL_COLOR}
                      fillOpacity={opacity}
                    />
                  )
                })}
              </Pie>
              <Tooltip
                formatter={(_, __, entry) => [
                  `${isLive ? '예측 이탈확률' : '이탈율'} ${entry.payload.rate}% (표본 ${entry.payload.count}명)`,
                  entry.payload.label,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs font-medium text-slate-500">
              {isLive ? '예측 이탈확률 최고 구간' : '이탈률 최고 구간'}
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">{maxBucket.label}</p>
            <p className="text-3xl font-extrabold text-rose-600">{maxRate}%</p>
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-400">
        {isLive
          ? '* 업로드한 기부자 데이터의 예측 결과를 구간별로 집계한 값입니다(구간 평균 예측 이탈확률). 빨간 조각이 예측 이탈확률이 가장 높은 구간입니다.'
          : '* 표본 20명 미만인 세부 구간(예: 초졸이하, 원불교 등)은 신뢰도가 낮아 제외했습니다. 이탈율은 학습 원본 데이터(2,014명) 전수 분석 기준입니다. 빨간 조각이 이탈률이 가장 높은 구간입니다.'}
      </p>
    </div>
  )
}
