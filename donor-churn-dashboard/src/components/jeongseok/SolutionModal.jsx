/**
 * SolutionModal — 그래프를 클릭했을 때 화면을 어둡게 하고 큰 모달로 솔루션을 보여준다.
 * 이탈률이 가장 높은 구간의 솔루션은 항상 크게 강조해서 보여주고,
 * 나머지 구간은 목록으로 접어두었다가 클릭하면 해당 솔루션이 펼쳐진다.
 * PDF 전체 리포트 다운로드는 시각화 패널(DemographicChartPanel)의 컬럼 메뉴 옆에 있다.
 */
import { useState } from 'react'
import { AlertTriangle, ChevronDown, Lightbulb, X } from 'lucide-react'
import { DEMOGRAPHIC_CHURN } from './demographicChurnData'

export default function SolutionModal({ selectedId, onSelect, onClose, data = DEMOGRAPHIC_CHURN }) {
  const selected = data.find((dim) => dim.id === selectedId) || data[0]
  const [expanded, setExpanded] = useState(null)

  const [topBucket, ...restBuckets] = [...selected.buckets].sort((a, b) => b.rate - a.rate)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {selected.title}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">구간별 맞춤 솔루션</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 이탈률 최상위 구간 — 항상 크게 강조 */}
        <div className="mt-5 rounded-2xl border-2 border-rose-300 bg-rose-50/70 p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white">
              <AlertTriangle className="h-3.5 w-3.5" />
              이탈률 1위
            </span>
            <span className="text-lg font-bold text-slate-900">{topBucket.label}</span>
            <span className="text-sm font-semibold text-rose-600">
              이탈율 {topBucket.rate}% · 표본 {topBucket.count}명
            </span>
          </div>
          <div className="mt-3 flex items-start gap-3 rounded-lg border-2 border-rose-300 bg-white px-4 py-3 shadow-sm">
            <Lightbulb className="mt-0.5 h-7 w-7 shrink-0 text-amber-500" />
            <p className="text-xl font-extrabold leading-snug text-slate-900">
              {topBucket.solution}
            </p>
          </div>
        </div>

        {/* 나머지 구간 — 클릭해서 펼쳐보기 */}
        <div className="mt-4 space-y-2">
          <p className="px-1 text-xs font-semibold text-slate-500">
            다른 구간 솔루션 보기 (클릭해서 펼치기)
          </p>
          {restBuckets.map((b) => {
            const isOpen = expanded === b.label
            return (
              <div key={b.label} className="rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : b.label)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800">{b.label}</span>
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    이탈율 {b.rate}% · 표본 {b.count}명
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>
                {isOpen ? (
                  <div className="flex items-start gap-2.5 border-t border-slate-100 px-4 py-3">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <p className="text-base font-semibold leading-snug text-slate-900">
                      {b.solution}
                    </p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        {/* 다른 컬럼 목록 */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold text-slate-500">다른 컬럼 솔루션 보기</p>
          <div className="flex flex-wrap gap-1.5">
            {data.map((dim) => (
              <button
                key={dim.id}
                type="button"
                onClick={() => onSelect(dim.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  dim.id === selected.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dim.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
