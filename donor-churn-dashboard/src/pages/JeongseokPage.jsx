/**
 * JeongseokPage — 정석 담당: 솔루션 도출
 * 탭 1: 위험도별 솔루션 (배치 예측 결과 기반)
 * 탭 2: 핵심 요인 솔루션 (이탈과 상관관계 높은 컬럼 기반)
 * 탭 3: 인구통계별 솔루션 (시각화 페이지와 같은 8개 항목 기준)
 */
import { useState } from 'react'
import SolutionPanel from '../components/jeongseok/SolutionPanel'
import ChurnDriverPanel from '../components/jeongseok/ChurnDriverPanel'
import DemographicSolutionPanel from '../components/jeongseok/DemographicSolutionPanel'

const TABS = [
  { id: 'risk', label: '위험도별 솔루션' },
  { id: 'driver', label: '핵심 요인 솔루션' },
  { id: 'demographic', label: '인구통계별 솔루션' },
]

export default function JeongseokPage() {
  const [tab, setTab] = useState('risk')

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 전환 시 상태(업로드 파일·결과 등)가 초기화되지 않도록 언마운트하지 않고 숨김 처리 */}
      <div className={tab === 'risk' ? '' : 'hidden'}>
        <SolutionPanel />
      </div>
      <div className={tab === 'driver' ? '' : 'hidden'}>
        <ChurnDriverPanel />
      </div>
      <div className={tab === 'demographic' ? '' : 'hidden'}>
        <DemographicSolutionPanel />
      </div>
    </div>
  )
}
