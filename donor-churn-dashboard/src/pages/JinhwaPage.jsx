/**
 * JinhwaPage — 배치 스코어링 결과를 이용한 시각화 페이지.
 */
import { Link, useOutletContext } from 'react-router-dom'
import ChurnVisualizationDashboard from '../components/jinhwa/ChurnVisualizationDashboard'

export default function JinhwaPage() {
  const { batchResult: batch, batchSourceFileName } = useOutletContext()

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Donor Churn Analysis
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          기부자 이탈 예측 시각화
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          업로드한 파일의 배치 예측 결과로 기부자 특성별 이탈률을 비교합니다.
        </p>
      </header>

      {batch ? (
        <>
          <section className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
            <p className="text-sm font-semibold text-sky-800">
              {batchSourceFileName ? `${batchSourceFileName} · ` : ''}
              {batch.n_total}명의 예측 결과를 표시하고 있습니다.
            </p>
            <p className="mt-1 text-xs text-sky-700">
              전체 이탈률과 기부자 특성별 이탈률을 확인할 수 있습니다.
            </p>
          </section>

          <ChurnVisualizationDashboard batch={batch} />
        </>
      ) : (
        <section className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-5">
          <p className="text-sm font-semibold text-amber-900">
            표시할 배치 예측 결과가 없습니다.
          </p>
          <p className="mt-1 text-sm text-amber-700">
            기부자 관리 페이지에서 파일을 업로드하고 배치 예측을 먼저 실행해 주세요.
          </p>
          <Link
            to="/daeho"
            className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            파일 업로드로 이동
          </Link>
        </section>
      )}

      <div className="border-t border-slate-200 pt-4">
        <Link to="/" className="text-sm font-medium text-teal-700 hover:underline">
          ← 홈으로
        </Link>
      </div>
    </div>
  )
}
