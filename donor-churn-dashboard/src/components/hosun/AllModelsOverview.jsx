import AccuracyComparisonChart from './AccuracyComparisonChart'
import { MODEL_EVALUATIONS } from './modelEvaluationData'

export default function AllModelsOverview({ onSelectModel }) {
  return (
    <div className="space-y-6">
      <AccuracyComparisonChart />
      <section>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-900">모델 한눈에 보기</h2>
          <p className="mt-1 text-xs text-slate-500">카드를 선택하면 상세 성능을 확인할 수 있습니다.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {MODEL_EVALUATIONS.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => onSelectModel(model.id)}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{model.name}</h3>
                {model.selected ? (
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                    최종 선택
                  </span>
                ) : null}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  model.category === 'deep-learning'
                    ? 'bg-violet-50 text-violet-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {model.category === 'deep-learning' ? 'DL' : 'ML'}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {model.accuracy}
                <span className="ml-0.5 text-sm font-medium text-slate-400">%</span>
              </p>
              <p className="text-[10px] font-medium text-slate-400">테스트 정확도</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">{model.feature}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
