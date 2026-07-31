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
import { predictBatch, templateDownloadUrl } from '../../services/api'
import { requireLogin } from '../../utils/requireLogin'
import DonorResultTable from './DonorResultTable'
import DonorDetailDrawer from './DonorDetailDrawer'

export default function BatchScoringPanel({
  mode = 'full',
  isAuthenticated = false,
  onRequireLogin,
  initialBatch = null,
  onBatchResult,
}) {
  const navigate = useNavigate()
  const isPreview = mode === 'preview'

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [batch, setBatch] = useState(() => initialBatch)
  const [filterHigh, setFilterHigh] = useState(false)
  const [selected, setSelected] = useState(null)
  const [pausedIds, setPausedIds] = useState(() => new Set())
  const [actionLogs, setActionLogs] = useState({})
  const [toast, setToast] = useState(null)

  const rows = useMemo(() => {
    if (!batch?.results) return []
    const scored = batch.results.filter((r) => r.probability != null)
    if (filterHigh) return scored.filter((r) => r.risk_level === 'High')
    return scored
  }, [batch, filterHigh])

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }

  const pushLog = (rowIndex, label) => {
    const at = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    setActionLogs((prev) => {
      const list = prev[rowIndex] || []
      return {
        ...prev,
        [rowIndex]: [{ id: `${Date.now()}-${label}`, label, at }, ...list].slice(
          0,
          8,
        ),
      }
    })
  }

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
      onBatchResult?.(data, file.name)
      setSelected(null)
      setPausedIds(new Set())
      setActionLogs({})
    } catch (err) {
      const raw = String(err?.message || '')
      const isColumnError =
        /필수 컬럼|피처 불일치|ColumnMapping|400/.test(raw) ||
        raw.includes('파일을 읽을 수 없습니다')
      setError(
        isColumnError
          ? '오른쪽 위의 「템플릿 CSV」를 다운로드한 뒤, 예시 형식에 맞춰 데이터를 작성해 다시 업로드해 주세요.'
          : '배치 예측에 실패했습니다. 잠시 후 다시 시도하거나 API 서버 상태를 확인해 주세요.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSms = () => {
    if (!selected?.phone) return
    showToast(`${selected.phone}로 문자 발송 요청을 접수했습니다.`)
    pushLog(selected.row_index, '문자 전송')
  }

  const handleEmail = () => {
    if (!selected?.email) return
    showToast(`${selected.email}로 이메일 발송 요청을 접수했습니다.`)
    pushLog(selected.row_index, '이메일 전송')
  }

  const handleTogglePause = () => {
    if (!selected) return
    const id = selected.row_index
    setPausedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        showToast(`행 #${id} 일시정지를 해제했습니다.`)
        pushLog(id, '일시정지 해제')
      } else {
        next.add(id)
        showToast(`행 #${id}을(를) 일시정지했습니다.`)
        pushLog(id, '일시정지')
      }
      return next
    })
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

        <p className="mt-4 max-w-2xl text-sm text-slate-500">
          파일을 업로드하면 이탈 확률을 계산하고, 고위험군에게는{' '}
          <strong className="font-semibold text-slate-700">기부정보 습득경로</strong>로
          캠페인 발송을 권고합니다.
        </p>

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
                3. 결과 (이탈확률 내림차순) · 행 클릭 시 상세
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/jinhwa')}
                  className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  예측 결과 시각화
                </button>
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
            </div>

            <DonorResultTable
              rows={rows}
              pausedIds={pausedIds}
              selectedRowIndex={selected?.row_index}
              onSelect={setSelected}
            />
          </section>
        </>
      ) : null}

      <DonorDetailDrawer
        open={Boolean(selected)}
        row={selected}
        paused={selected ? pausedIds.has(selected.row_index) : false}
        actionLogs={selected ? actionLogs[selected.row_index] || [] : []}
        onClose={() => setSelected(null)}
        onSms={handleSms}
        onEmail={handleEmail}
        onTogglePause={handleTogglePause}
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
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
