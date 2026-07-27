/**
 * BatchScoringPanel — 기부자 관리 · 배치 스코어링 UI
 * mode: preview(메인 미리보기) | full(대호 페이지 실제 기능)
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  Download,
  Loader2,
  Filter,
  Radio,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import Badge from '../common/Badge'
import { REQUIRED_BATCH_COLUMNS } from '../../data/inferenceFields'
import { predictBatch, templateDownloadUrl } from '../../services/api'
import { requireLogin } from '../../utils/requireLogin'

export default function BatchScoringPanel({
  mode = 'full',
  isAuthenticated = false,
  onRequireLogin,
}) {
  const navigate = useNavigate()
  const isPreview = mode === 'preview'

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [batch, setBatch] = useState(null)
  const [filterHigh, setFilterHigh] = useState(false)

  const rows = useMemo(() => {
    if (!batch?.results) return []
    const scored = batch.results.filter((r) => r.probability != null)
    if (filterHigh) return scored.filter((r) => r.risk_level === 'High')
    return scored
  }, [batch, filterHigh])

  const guardAction = (e) => {
    if (isPreview && !isAuthenticated) {
      e?.preventDefault()
      if (onRequireLogin) onRequireLogin()
      else requireLogin(navigate, '/')
    }
  }

  const handleUpload = async () => {
    if (isPreview) {
      guardAction()
      return
    }
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
      setError(err?.message || '배치 예측에 실패했습니다. API 서버를 확인하세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Donor Management
          </p>
          {isPreview ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              미리보기
            </span>
          ) : null}
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          기부자 관리 · 배치 스코어링
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          파일을 업로드하면 이탈 확률을 계산하고, 고위험군에게는{' '}
          <strong className="font-semibold text-slate-700">기부정보 습득경로</strong>로
          캠페인 발송을 권고합니다.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">1. 파일 업로드</h2>
            <p className="mt-1 text-xs text-slate-500">
              CSV / Excel · 한글 컬럼명·영문 alias·설문코드 모두 허용
            </p>
          </div>
          {isPreview ? (
            <button
              type="button"
              onClick={guardAction}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              템플릿 CSV
            </button>
          ) : (
            <a
              href={templateDownloadUrl()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              템플릿 CSV
            </a>
          )}
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {REQUIRED_BATCH_COLUMNS.map((c) => (
            <li key={c.key}>
              <Badge variant="neutral">{c.label}</Badge>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isPreview ? (
            <button
              type="button"
              onClick={guardAction}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-teal-400 hover:bg-teal-50/40"
            >
              <Upload className="h-4 w-4 text-teal-600" />
              <span>CSV / Excel 선택</span>
            </button>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:border-teal-400 hover:bg-teal-50/40">
              <Upload className="h-4 w-4 text-teal-600" />
              <span>{file ? file.name : 'CSV / Excel 선택'}</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
          <button
            type="button"
            disabled={!isPreview && loading}
            onClick={handleUpload}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-70"
          >
            {!isPreview && loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            배치 예측 실행
          </button>
        </div>
        {error ? (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}
      </section>

      {!isPreview && batch ? (
        <>
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">2. 요약</h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="전체 행" value={batch.n_total} />
                <Stat label="스코어링" value={batch.n_scored} />
                <Stat label="고위험" value={batch.n_high_risk} accent />
                <Stat label="임계값" value={batch.threshold} />
              </dl>
              <p className="mt-3 text-xs text-slate-400">모델: {batch.model_name}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Radio className="h-4 w-4 text-teal-600" />
                고위험군 권장 발송 채널
              </h2>
              {batch.channel_distribution?.length ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={batch.channel_distribution}
                      layout="vertical"
                      margin={{ left: 8, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="channel"
                        width={120}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-slate-400">고위험 결과가 없습니다.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">
                3. 결과 (이탈확률 내림차순)
              </h2>
              <button
                type="button"
                onClick={() => setFilterHigh((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  filterHigh
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                {filterHigh ? '고위험만 표시 중' : '고위험만 보기'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-2 py-2 font-medium">#</th>
                    <th className="px-2 py-2 font-medium">확률</th>
                    <th className="px-2 py-2 font-medium">위험</th>
                    <th className="px-2 py-2 font-medium">권장 채널</th>
                    <th className="px-2 py-2 font-medium">Next Step</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={`${r.row_index}-${i}`} className="border-b border-slate-50">
                      <td className="px-2 py-2.5 text-slate-400">{r.row_index}</td>
                      <td className="px-2 py-2.5 font-semibold text-slate-900">
                        {r.probability_pct}%
                      </td>
                      <td className="px-2 py-2.5">
                        <Badge
                          variant={
                            r.risk_level === 'High'
                              ? 'danger'
                              : r.risk_level === 'Medium'
                                ? 'warning'
                                : 'success'
                          }
                        >
                          {r.risk_level}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5 text-slate-700">
                        {r.recommended_channel}
                      </td>
                      <td className="max-w-md px-2 py-2.5 text-xs leading-relaxed text-slate-600">
                        {r.next_step}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows.length ? (
                <p className="py-8 text-center text-sm text-slate-400">표시할 행이 없습니다.</p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd
        className={`mt-1 text-xl font-bold ${accent ? 'text-rose-600' : 'text-slate-900'}`}
      >
        {value}
      </dd>
    </div>
  )
}
