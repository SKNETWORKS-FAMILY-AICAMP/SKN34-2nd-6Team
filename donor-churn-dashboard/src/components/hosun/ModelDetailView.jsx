import { Award, Database, Search, SlidersHorizontal } from 'lucide-react'
import ConfusionMatrix from './ConfusionMatrix'
import DeepLearningDetails from './DeepLearningDetails'
import ModelMetricChart from './ModelMetricChart'
import { TRAINING_CONTEXT } from './modelEvaluationData'

function displayScore(value) {
  return value == null ? '노트북 출력 없음' : `${value.toFixed(2)}%`
}

export default function ModelDetailView({ model }) {
  if (!model) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        선택한 모델의 평가 데이터를 찾을 수 없습니다.
      </div>
    )
  }
  const trainSize = model.trainSize ?? TRAINING_CONTEXT.trainSize
  const testSize = model.testSize ?? TRAINING_CONTEXT.testSize
  const deepLearning = model.category === 'deep-learning'

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className={`text-xs font-semibold uppercase tracking-wide ${
                deepLearning ? 'text-violet-700' : 'text-teal-700'
              }`}>{model.type}</p>
              {deepLearning ? (
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  DL
                </span>
              ) : null}
              {model.selected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                  <Award className="h-3 w-3" />
                  최종 선택 모델
                </span>
              ) : null}
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{model.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{model.description}</p>
          </div>
          <div className="rounded-xl bg-slate-900 px-5 py-3 text-right text-white">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Test accuracy</p>
            <p className="text-2xl font-bold">{model.accuracy}%</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info
            icon={Database}
            label="데이터"
            value={`학습 ${trainSize.toLocaleString()} · ${
              model.validationSize ? `검증 ${model.validationSize.toLocaleString()} · ` : ''
            }테스트 ${testSize.toLocaleString()}`}
          />
          <Info icon={Search} label="최적화" value={model.searchMethod} />
          <Info icon={SlidersHorizontal} label="CV F1-macro" value={displayScore(model.cvF1)} />
          <Info
            icon={Award}
            label="판정 임계값"
            value={model.threshold == null ? '별도 기록 없음' : model.threshold.toFixed(2)}
          />
        </div>
      </section>

      <DeepLearningDetails model={model} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <ModelMetricChart model={model} />
        <ConfusionMatrix matrix={model.confusionMatrix} modelName={model.name} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">주요 하이퍼파라미터</h2>
          {model.hyperparameters?.length ? (
            <dl className="mt-4 divide-y divide-slate-100">
              {model.hyperparameters.map(([name, value]) => (
                <div key={name} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <dt className="font-mono text-xs text-slate-500">{name}</dt>
                  <dd className="font-mono font-semibold text-teal-700">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-400">
              노트북 출력에 최적 파라미터 값이 기록되지 않았습니다.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">평가 해석</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">{model.interpretation}</p>
          {model.selected ? (
            <div className="mt-4 rounded-lg bg-teal-50 p-4 text-xs leading-5 text-teal-800">
              <strong>선정 기준:</strong> 정확도만 최대화하지 않고 실제 이탈자를 놓치지 않도록
              이탈 재현율을 우선했습니다. 클래스 불균형에는{' '}
              <code className="font-mono font-semibold">scale_pos_weight</code>를 적용했습니다.
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5 text-teal-600" />
        {label}
      </p>
      <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-700">{value}</p>
    </div>
  )
}
