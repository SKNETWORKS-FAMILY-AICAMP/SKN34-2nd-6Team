/**
 * BatchScoringPanel — 기부자 관리 · 배치 스코어링 UI
 * mode: preview(메인 미리보기) | full(대호 페이지 실제 기능)
 */
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Upload,
  Download,
  Loader2,
  Filter,
  Radio,
  BarChart3,
  ArrowRight,
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
import { useAuth } from '../../context/AuthContext'
import { upsertDonorsFromBatch } from '../../services/donorRosterDb'
import { loadLatestBatch, saveLatestBatch } from '../../services/latestBatchStore'
import DonorResultTable from './DonorResultTable'
import DonorDetailDrawer from './DonorDetailDrawer'
import RestSuggestModal from './RestSuggestModal'
import RestConfirmModal from './RestConfirmModal'

function ChannelTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="mt-1 text-slate-600">
        고위험 인원 <span className="font-semibold text-teal-700">{value}명</span>
      </p>
    </div>
  )
}

export default function BatchScoringPanel({
  mode = 'full',
  isAuthenticated = false,
  onRequireLogin,
}) {
  const navigate = useNavigate()
  const { user, isAuthenticated: authOk } = useAuth()
  const loggedIn = Boolean(isAuthenticated || authOk)
  const isPreview = mode === 'preview'

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [batch, setBatch] = useState(() => (isPreview ? null : loadLatestBatch()?.batch ?? null))
  const [sortByRisk, setSortByRisk] = useState(false)
  const [selected, setSelected] = useState(null)
  const [restingIds, setRestingIds] = useState(() => new Set())
  const [suggestedRestIds, setSuggestedRestIds] = useState(() => new Set())
  const [restMeta, setRestMeta] = useState({})
  const [actionLogs, setActionLogs] = useState({})
  const [toast, setToast] = useState(null)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const rows = useMemo(() => {
    if (!batch?.results) return []
    const scored = batch.results.filter((r) => r.probability != null)
    if (!sortByRisk) return scored
    return [...scored].sort(
      (a, b) => Number(b.probability ?? 0) - Number(a.probability ?? 0),
    )
  }, [batch, sortByRisk])

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
    if (!isPreview) return
    e?.preventDefault()
    if (!loggedIn) {
      if (onRequireLogin) onRequireLogin()
      else requireLogin(navigate, '/')
      return
    }
    navigate('/daeho')
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
      saveLatestBatch(data)
      setSelected(null)
      setRestingIds(new Set())
      setSuggestedRestIds(new Set())
      setRestMeta({})
      setActionLogs({})
      setSuggestOpen(false)
      setConfirmOpen(false)

      if (user && user.provider !== 'kakao' && data?.results?.length) {
        try {
          const { saved, updated } = await upsertDonorsFromBatch(user, data.results)
          showToast(
            `마이페이지 명단에 반영했습니다. (새로 ${saved}명 · 갱신 ${updated}명)`,
          )
        } catch (saveErr) {
          console.error(saveErr)
          showToast(
            '예측은 완료됐지만 명단 저장에 실패했습니다. Firestore 규칙을 확인해 주세요.',
          )
        }
      }
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

  const handleSendSms = () => {
    if (!selected?.phone) return
    showToast(`${selected.phone}로 문자 발송 요청을 접수했습니다.`)
    pushLog(selected.row_index, 'AI 문자 발송')
  }

  const handleSendEmail = () => {
    if (!selected?.email) return
    showToast(`${selected.email}로 이메일 발송 요청을 접수했습니다.`)
    pushLog(selected.row_index, 'AI 이메일 발송')
  }

  const handleSuggestRest = ({ channel, months }) => {
    if (!selected) return
    const id = selected.row_index
    setSuggestedRestIds((prev) => new Set(prev).add(id))
    setRestMeta((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        suggestedAt: Date.now(),
        suggestedChannel: channel,
        suggestedMonths: months,
      },
    }))
    showToast('쉬어가기 제안을 발송했습니다.')
    pushLog(id, `쉬어가기 제안 (${channel}, ${months}개월)`)
    setSuggestOpen(false)
  }

  const handleConfirmRest = ({ confirmedVia, months, note }) => {
    if (!selected) return
    const id = selected.row_index
    setRestingIds((prev) => new Set(prev).add(id))
    setRestMeta((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        months,
        confirmedVia,
        note,
      },
    }))
    showToast('잠시 쉬어가기로 반영했습니다.')
    pushLog(id, `쉬어가기 요청 반영 (${confirmedVia}, ${months}개월)`)
    setConfirmOpen(false)
  }

  const handleResume = () => {
    if (!selected) return
    if (!window.confirm('후원을 다시 시작할까요?')) return
    const id = selected.row_index
    setRestingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    showToast('다시 시작했습니다.')
    pushLog(id, '다시 시작')
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            기부자 관리
          </p>
          {isPreview ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              미리보기
            </span>
          ) : null}
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          일괄 이탈 예측
        </h1>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">1. 파일 업로드</h2>
            <p className="mt-1 text-xs text-slate-500">
              CSV 또는 Excel 파일을 올리면 됩니다 (템플릿 형식 권장)
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
          파일을 올리면 각 기부자의 이탈 가능성을 계산하고, 고위험 기부자에게는
          어떤 경로로 연락하면 좋을지 함께 알려 줍니다.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
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
            이탈 예측 실행
          </button>
        </div>
        {error ? (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}
      </section>

      {!isPreview && batch ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3">
            <p className="text-xs font-medium text-teal-800">
              예측이 완료되었습니다. 인구통계별 이탈 통계와 맞춤 솔루션을 확인해 보세요.
            </p>
            <Link
              to="/jeongseok"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              통계 및 솔루션 보기
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">2. 요약</h2>
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="전체 인원" value={batch.n_total} />
                <Stat label="분석 완료" value={batch.n_scored} />
                <Stat label="고위험" value={batch.n_high_risk} accent />
                <Stat
                  label="고위험 기준"
                  value={`${Math.round(Number(batch.threshold) * 100)}%`}
                />
              </dl>
              <p className="mt-3 text-xs text-slate-400">
                이탈 확률이 고위험 기준 이상이면 고위험으로 분류합니다
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Radio className="h-4 w-4 text-teal-600" />
                고위험 기부자 · 추천 연락 경로
              </h2>
              <p className="mb-3 text-xs text-slate-500">
                고위험으로 분류된 기부자 수 (경로별)
              </p>
              {batch.channel_distribution?.length ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={batch.channel_distribution.map((d) => ({
                        channel: d.channel,
                        인원: d.count,
                      }))}
                      layout="vertical"
                      margin={{ left: 4, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                        unit="명"
                      />
                      <YAxis
                        type="category"
                        dataKey="channel"
                        width={132}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip content={<ChannelTooltip />} />
                      <Bar dataKey="인원" fill="#0d9488" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-slate-400">고위험 기부자가 없습니다.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">
                3. 결과 목록 · 행을 누르면 상세 확인
              </h2>
              <button
                type="button"
                onClick={() => setSortByRisk((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  sortByRisk
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                {sortByRisk ? '위험도 높은 순 적용 중' : '위험도 높은 순'}
              </button>
            </div>

            <DonorResultTable
              rows={rows}
              restingIds={restingIds}
              selectedRowIndex={selected?.row_index}
              onSelect={setSelected}
            />
          </section>
        </>
      ) : null}

      <DonorDetailDrawer
        open={Boolean(selected)}
        row={selected}
        resting={selected ? restingIds.has(selected.row_index) : false}
        suggested={selected ? suggestedRestIds.has(selected.row_index) : false}
        actionLogs={selected ? actionLogs[selected.row_index] || [] : []}
        onClose={() => {
          setSelected(null)
          setSuggestOpen(false)
          setConfirmOpen(false)
        }}
        onSendSms={handleSendSms}
        onSendEmail={handleSendEmail}
        onSuggestRest={() => setSuggestOpen(true)}
        onConfirmRest={() => setConfirmOpen(true)}
        onResume={handleResume}
      />

      <RestSuggestModal
        open={suggestOpen && Boolean(selected)}
        donorName={selected?.name}
        email={selected?.email}
        phone={selected?.phone}
        onClose={() => setSuggestOpen(false)}
        onSubmit={handleSuggestRest}
      />

      <RestConfirmModal
        open={confirmOpen && Boolean(selected)}
        onClose={() => setConfirmOpen(false)}
        onSubmit={handleConfirmRest}
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
