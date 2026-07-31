import ModelEvaluationExplorer from '../components/hosun/ModelEvaluationExplorer'

export default function HosunPage() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          Model History
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          모델 히스토리
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          동일한 테스트셋에서 다섯 가지 분류 모델을 비교하고, 이탈자를 놓치지 않는
          재현율과 F1 점수를 중심으로 최종 모델을 선정한 과정을 소개합니다.
        </p>
      </header>

      <ModelEvaluationExplorer />

      <footer className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-xs leading-5 text-slate-500">
        표시된 수치는 실행 당시 테스트셋의 반올림된 결과이며, 운영 데이터에서 동일한 성능을
        보장하지 않습니다.
      </footer>
    </div>
  )
}
