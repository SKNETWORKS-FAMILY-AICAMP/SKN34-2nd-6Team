/**
 * SolutionPanel — 위험군별 재참여 솔루션
 * 1) 기부자 관리에서 쌓인 Firestore 명단을 우선 표시
 * 2) 명단이 없으면 /daeho 로 유도
 * 3) (선택) 이 페이지에서 파일 재업로드로도 실행 가능
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Download, Loader2, ArrowRight, Users } from 'lucide-react'
import { predictBatch, templateDownloadUrl } from '../../services/api'
import { listDonors } from '../../services/donorRosterDb'
import { useAuth } from '../../context/AuthContext'
import SolutionSegmentCard from './SolutionSegmentCard'

const RISK_ORDER = ['High', 'Medium', 'Low']

function toSolutionRows(donors) {
  return donors
    .filter((d) => d.risk_level || d.probability != null)
    .map((d, i) => ({
      row_index: d.id ?? i + 1,
      name: d.name,
      email: d.email,
      phone: d.phone,
      probability: d.probability,
      probability_pct: d.probability_pct,
      risk_level: d.risk_level,
      recommended_channel: d.recommended_channel,
      next_step: d.next_step,
    }))
}

function buildSegments(results) {
  if (!results?.length) return []
  const groups = new Map(RISK_ORDER.map((level) => [level, []]))
  for (const row of results) {
    const level = row.risk_level || 'Low'
    if (!groups.has(level)) groups.set(level, [])
    groups.get(level).push(row)
  }
  return RISK_ORDER.map((level) => ({
    level,
    rows: (groups.get(level) || []).sort(
      (a, b) => Number(b.probability ?? 0) - Number(a.probability ?? 0),
    ),
  })).filter((seg) => seg.rows.length > 0)
}

export default function SolutionPanel() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rosterLoading, setRosterLoading] = useState(true)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [source, setSource] = useState(null) // 'roster' | 'upload' | null

  useEffect(() => {
    if (authLoading) return

    let cancelled = false
    const loadRoster = async () => {
      setRosterLoading(true)
      setError('')

      if (!isAuthenticated || !user || user.provider === 'kakao') {
        if (!cancelled) {
          setResults([])
          setSource(null)
          setRosterLoading(false)
        }
        return
      }

      try {
        const donors = await listDonors(user)
        if (cancelled) return
        const rows = toSolutionRows(donors)
        setResults(rows)
        setSource(rows.length ? 'roster' : null)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setResults([])
          setSource(null)
        }
      } finally {
        if (!cancelled) setRosterLoading(false)
      }
    }

    loadRoster()
    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, user])

  const segments = useMemo(() => buildSegments(results), [results])

  const handleUpload = async () => {
    if (!file) {
      setError('CSV 또는 Excel 파일을 선택하세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await predictBatch(file)
      const rows = Array.isArray(data?.results) ? data.results : []
      setResults(rows)
      setSource(rows.length ? 'upload' : null)
    } catch {
      setError('예측에 실패했습니다. 파일 형식을 확인하거나 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  const showEmpty =
    !authLoading && !rosterLoading && !loading && segments.length === 0

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
          기부자 관리에서 예측한 결과를 위험도별로 나눠, 권장 채널과 다음 액션을 보여줍니다.
        </p>
      </header>

      {(authLoading || rosterLoading) && !segments.length ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          기부자 명단을 확인하는 중…
        </div>
      ) : null}

      {showEmpty ? (
        <section className="rounded-xl border border-dashed border-teal-300 bg-teal-50/40 px-6 py-10 text-center shadow-sm">
          <Users className="mx-auto h-10 w-10 text-teal-600" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            아직 이탈 예측 결과가 없습니다
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            {!isAuthenticated
              ? '로그인 후 기부자 관리에서 파일을 올려 이탈 예측을 실행하면, 이곳에 위험도별 솔루션이 표시됩니다.'
              : user?.provider === 'kakao'
                ? '기부자 명단 연동은 이메일(Google) 로그인에서 지원됩니다. 기부자 관리에서 예측을 실행하거나, 아래에서 파일을 직접 올려 주세요.'
                : '기부자 관리 페이지에서 CSV/Excel을 올리고 「이탈 예측 실행」을 먼저 해 주세요. 결과가 명단에 저장되면 여기로 자동 반영됩니다.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {!isAuthenticated ? (
              <Link
                to="/login"
                state={{ from: '/jeongseok' }}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                로그인하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
            <Link
              to="/daeho"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              기부자 관리에서 예측하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      {segments.length > 0 ? (
        <>
          <p className="text-xs text-slate-500">
            {source === 'roster'
              ? `마이페이지 명단 기준 · ${results.length}명`
              : source === 'upload'
                ? `이 페이지에서 업로드한 결과 · ${results.length}명`
                : null}
          </p>
          <section className="grid gap-6 lg:grid-cols-3">
            {segments.map((seg) => (
              <SolutionSegmentCard key={seg.level} level={seg.level} rows={seg.rows} />
            ))}
          </section>
        </>
      ) : null}

      {/* 보조: 명단이 없거나 새로 돌리고 싶을 때 이 페이지에서도 업로드 가능 */}
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="mb-2 text-xs font-semibold text-slate-500">
          {segments.length > 0
            ? '다른 파일로 다시 분석하려면'
            : '또는 이 페이지에서 바로 파일 분석'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
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
    </div>
  )
}
