/**
 * JeongseokPage — 정석 담당: 기부자 관리(배치 예측) 결과를 바탕으로 인구통계 8개 컬럼의
 * 이탈 통계와 맞춤 솔루션을 보여준다. 자료를 아직 분석하지 않았다면 기부자 관리로
 * 이동할 수 있는 안내 화면을 보여주고, 분석 결과가 있으면 버튼 없이 바로 그 데이터로
 * 그래프를 그린다.
 * 그래프를 클릭하면 화면이 어두워지며 큰 모달로 해당 컬럼의 솔루션을 보여준다.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Sparkles, UploadCloud, Users } from 'lucide-react'
import DemographicChartPanel from '../components/jeongseok/DemographicChartPanel'
import SolutionModal from '../components/jeongseok/SolutionModal'
import { DEMOGRAPHIC_CHURN } from '../components/jeongseok/demographicChurnData'
import { computeLiveDemographicChurn } from '../components/jeongseok/liveChurnStats'
import { loadLatestBatch, loadPersistedBatch, subscribeLatestBatch } from '../services/latestBatchStore'

function formatSavedAt(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PageHeader({ children }) {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
        Demographic Churn Solutions
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        통계 및 솔루션
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        연령대·성별·학력·종교·고용상태·자녀유무·소득구간·혼인상태 8개 컬럼의 이탈율입니다.
        그래프를 클릭하면 해당 컬럼의 맞춤 솔루션을 볼 수 있습니다.
      </p>
      {children}
    </header>
  )
}

function EmptyState({ onPreview, hasPersisted, onViewPersisted }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-slate-50 p-10 text-center shadow-sm">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-100/60 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-rose-100/40 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col items-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
          <BarChart3 className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-lg font-bold text-slate-900">
          아직 분석된 기부자 데이터가 없어요
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          기부자 관리 페이지에서 CSV·Excel 파일을 업로드하고 「이탈 예측 실행」을 누르면,
          그 결과를 바탕으로 인구통계별 이탈 통계와 맞춤 솔루션을 바로 확인할 수 있어요.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/daeho"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            <UploadCloud className="h-4 w-4" />
            기부자 관리로 이동
            <ArrowRight className="h-4 w-4" />
          </Link>

          {hasPersisted ? (
            <button
              type="button"
              onClick={onViewPersisted}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
            >
              <BarChart3 className="h-4 w-4" />
              이전 데이터 확인
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onPreview}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 underline-offset-2 hover:text-teal-700 hover:underline"
        >
          <Sparkles className="h-3.5 w-3.5" />
          예시(학습 데이터)로 먼저 살펴보기
        </button>
      </div>
    </div>
  )
}

function SampleBanner({ onClose }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="flex items-center gap-2 text-xs font-medium text-amber-800">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        지금 보시는 그래프는 학습 원본 데이터 기준 예시입니다. 실제 데이터를 보려면 기부자
        관리에서 분석을 실행하세요.
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/daeho"
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
        >
          기부자 관리로 이동
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
        >
          닫기
        </button>
      </div>
    </div>
  )
}

function LiveStatsBar({ batch, savedAt }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-teal-800">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          분석 인원 {batch?.n_scored ?? 0}명
        </span>
        <span>고위험 {batch?.n_high_risk ?? 0}명</span>
        {savedAt ? <span className="text-teal-600/80">최근 분석 {formatSavedAt(savedAt)}</span> : null}
      </p>
      <Link
        to="/daeho"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
      >
        새 자료로 다시 분석하기
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

export default function JeongseokPage() {
  const [selectedId, setSelectedId] = useState(null)
  const [latest, setLatest] = useState(() => loadLatestBatch())
  const [showSample, setShowSample] = useState(false)

  useEffect(() => subscribeLatestBatch(() => setLatest(loadLatestBatch())), [])

  const scoredRows = useMemo(
    () => latest?.batch?.results?.filter((r) => r.probability != null) ?? [],
    [latest],
  )
  const liveData = useMemo(() => computeLiveDemographicChurn(scoredRows), [scoredRows])
  const hasLiveData = Boolean(liveData)
  const data = hasLiveData ? liveData : DEMOGRAPHIC_CHURN

  if (!hasLiveData && !showSample) {
    const persisted = loadPersistedBatch()
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          onPreview={() => setShowSample(true)}
          hasPersisted={Boolean(persisted)}
          onViewPersisted={() => setLatest(persisted)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="mt-4">
          {hasLiveData ? (
            <LiveStatsBar batch={latest.batch} savedAt={latest.savedAt} />
          ) : (
            <SampleBanner onClose={() => setShowSample(false)} />
          )}
        </div>
      </PageHeader>

      <DemographicChartPanel
        selectedId={selectedId}
        onSelect={setSelectedId}
        data={data}
        isLive={hasLiveData}
      />

      {selectedId ? (
        <SolutionModal
          key={selectedId}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onClose={() => setSelectedId(null)}
          data={data}
        />
      ) : null}
    </div>
  )
}
