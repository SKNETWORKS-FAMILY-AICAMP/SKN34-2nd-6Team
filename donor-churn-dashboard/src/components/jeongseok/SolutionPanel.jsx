/**
 * SolutionPanel — 위험군별 재참여 솔루션 도출
 * 대호의 배치 예측 API(predictBatch)를 재사용해, risk_level별로
 * 추천 채널·다음 액션(next_step)을 세그먼트 카드로 보여준다.
 */
import { useMemo, useState } from 'react'
import { Upload, Download, Loader2 } from 'lucide-react'
import { predictBatch, templateDownloadUrl } from '../../services/api'
import SolutionSegmentCard from './SolutionSegmentCard'

const RISK_ORDER = ['High', 'Medium', 'Low']

export default function SolutionPanel() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [batch, setBatch] = useState(null)

  const segments = useMemo(() => {
    if (!batch?.results) return []
    const groups = new Map(RISK_ORDER.map((level) => [level, []]))
    for (const row of batch.results) {
      if (!groups.has(row.risk_level)) groups.set(row.risk_level, [])
      groups.get(row.risk_level).push(row)
    }
    return RISK_ORDER.map((level) => ({
      level,
      rows: (groups.get(level) || []).sort((a, b) => b.probability - a.probability),
    })).filter((seg) => seg.rows.length > 0)
  }, [batch])

  const handleUpload = async () => {
    if (!file) {
      setError('CSV 또는 Excel 파일을 선택하세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await predictBatch(file)
      setBatch(data)
    } catch (err) {
      setError('예측에 실패했습니다. 파일 형식을 확인하거나 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          Retention Solutions
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          솔루션 도출
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          이탈 위험도별로 권장 채널과 다음 액션을 확인하고 바로 적용하세요.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">파일 업로드</span>

          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:border-teal-400 hover:bg-teal-50/40">
            <Upload className="h-3.5 w-3.5 text-teal-600" />
            <span className="max-w-[10rem] truncate">
              {file ? file.name : 'CSV / Excel 선택'}
            </span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            type="button"
            disabled={loading}
            onClick={handleUpload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            솔루션 도출 실행
          </button>

          <a
            href={templateDownloadUrl()}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            템플릿
          </a>
        </div>
        {error ? (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>
        ) : null}
      </section>

      {segments.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-3">
          {segments.map((seg) => (
            <SolutionSegmentCard key={seg.level} level={seg.level} rows={seg.rows} />
          ))}
        </section>
      ) : null}
    </div>
  )
}
