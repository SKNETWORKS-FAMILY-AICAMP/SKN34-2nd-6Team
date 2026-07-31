import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MODEL_EVALUATIONS } from './modelEvaluationData'

function AccuracyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const model = payload[0].payload
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-900">{model.name}</p>
      <p className="mt-1 text-teal-700">테스트 정확도 {model.accuracy}%</p>
      {model.selected ? <p className="mt-1 font-medium text-teal-600">최종 선택 모델</p> : null}
    </div>
  )
}

export default function AccuracyComparisonChart() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Accuracy overview
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">테스트 정확도 비교</h2>
        <p className="mt-1 text-xs text-slate-500">
          테스트셋 903건 기준 · ML(seed 88)과 MLP(seed 42)는 분할 샘플이 다름
        </p>
        <div className="mt-2 flex gap-3 text-[10px] text-slate-500">
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-400" />ML</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-violet-500" />DL</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-teal-600" />최종 선택 ML</span>
        </div>
      </div>
      <div className="mt-5 h-72" role="img" aria-label="다섯 개 모델의 테스트 정확도 비교 막대그래프">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MODEL_EVALUATIONS} margin={{ top: 22, right: 8, left: -12, bottom: 28 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-12}
              textAnchor="end"
              tick={{ fontSize: 10, fill: '#475569' }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <Tooltip content={<AccuracyTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="accuracy" name="테스트 정확도" radius={[5, 5, 0, 0]}>
              {MODEL_EVALUATIONS.map((model) => (
                <Cell
                  key={model.id}
                  fill={model.selected ? '#0d9488' : model.category === 'deep-learning' ? '#8b5cf6' : '#94a3b8'}
                />
              ))}
              <LabelList
                dataKey="accuracy"
                position="top"
                formatter={(value) => `${value}%`}
                style={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
