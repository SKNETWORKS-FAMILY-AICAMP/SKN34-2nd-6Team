import { ArrowRight, BrainCircuit } from 'lucide-react'

export default function DeepLearningDetails({ model }) {
  if (model.category !== 'deep-learning') return null

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-violet-600" />
          <h2 className="text-base font-bold text-slate-900">네트워크 구조</h2>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {model.architecture.map((layer, index) => (
            <div key={layer.name} className="contents">
              <div className="min-w-28 rounded-lg border border-violet-100 bg-violet-50 px-3 py-3 text-center">
                <p className="text-xs font-semibold text-violet-800">{layer.name}</p>
                <p className="mt-1 text-[10px] text-violet-600">{layer.units}</p>
              </div>
              {index < model.architecture.length - 1 ? (
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="MLP 학습 설정과 결과">
        <TrainingCard label="Early Stopping" value={`Epoch ${model.trainingConfig.stoppedEpoch}`} detail={model.trainingConfig.earlyStopping} />
        <TrainingCard label="클래스 불균형" value="pos_weight 1.2564" detail={model.trainingConfig.classBalance} />
        <TrainingCard label="검증 결과" value={`Accuracy ${model.trainingConfig.validationAccuracy.toFixed(2)}%`} detail={`Recall ${model.trainingConfig.validationRecall.toFixed(2)}%`} />
        <TrainingCard label="테스트 손실" value={model.trainingConfig.testLoss.toFixed(4)} detail={`최대 epoch ${model.trainingConfig.maxEpochs.toLocaleString()}`} />
      </section>

     
    </div>
  )
}

function TrainingCard({ label, value, detail }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">{label}</p>
      <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-[10px] leading-4 text-slate-400">{detail}</p>
    </article>
  )
}
