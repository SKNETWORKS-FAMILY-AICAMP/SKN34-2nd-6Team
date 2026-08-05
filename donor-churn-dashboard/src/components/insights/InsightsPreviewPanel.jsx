/**
 * InsightsPreviewPanel — 홈 메인용 통계 및 솔루션 미리보기
 * 예시(학습) 데이터 차트를 보여주고, 상호작용 시 로그인 유도 또는 /insights 이동
 */
import { useNavigate } from 'react-router-dom'
import DemographicChartPanel from './DemographicChartPanel'
import { DEMOGRAPHIC_CHURN } from './demographicChurnData'
import { requireLogin } from '../../utils/requireLogin'

export default function InsightsPreviewPanel({
  isAuthenticated = false,
  onRequireLogin,
}) {
  const navigate = useNavigate()

  const guardAction = (e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    if (!isAuthenticated) {
      if (onRequireLogin) onRequireLogin()
      else requireLogin(navigate, '/')
      return
    }
    navigate('/insights')
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Demographic Churn Solutions
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            미리보기
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          통계 및 솔루션
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          연령대·성별·학력 등 인구통계별 이탈율 예시입니다. 그래프를 클릭하면 전체
          기능 페이지로 이동합니다.
        </p>
      </header>

      <DemographicChartPanel
        selectedId={null}
        onSelect={() => guardAction()}
        data={DEMOGRAPHIC_CHURN}
        isLive={false}
        showPdfButton={false}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3">
        <p className="text-xs font-medium text-teal-800">
          실제 업로드 데이터 기준 통계와 맞춤 솔루션은 전체 페이지에서 확인할 수
          있습니다.
        </p>
        <button
          type="button"
          onClick={guardAction}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          통계 및 솔루션 보기
        </button>
      </div>
    </div>
  )
}
