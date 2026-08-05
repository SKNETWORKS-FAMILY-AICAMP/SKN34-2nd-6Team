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

const COLORS = ['#64748b', '#0f766e', '#0d9488', '#14b8a6', '#8b5cf6']

export default function ModelMetricChart({ model }) {
  const data = [
    { metric: '정확도', value: model.accuracy },
    { metric: '정밀도', value: model.precision },
    { metric: '재현율', value: model.recall },
    { metric: 'F1', value: model.f1 },
  ]
  if (model.auc != null) data.push({ metric: 'ROC-AUC', value: model.auc })

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">테스트 성능 지표</h2>
      <p className="mt-1 text-xs text-slate-500">
        정밀도·재현율·F1은 이탈 클래스(클래스 2) 기준
      </p>
      <div className="mt-5 h-64" role="img" aria-label={`${model.name} 테스트 성능 지표 막대그래프`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 22, right: 8, left: -12, bottom: 4 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#475569' }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <Tooltip formatter={(value) => [`${value}%`, '성능']} />
            <Bar dataKey="value" radius={[5, 5, 0, 0]}>
              {data.map((item, index) => (
                <Cell key={item.metric} fill={COLORS[index]} />
              ))}
              <LabelList
                dataKey="value"
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
