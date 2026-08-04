/**
 * JiyunPage — 마이페이지 (프로필 + 누적 기부자 명단 + 상세 후속 조치)
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { requireLogin } from '../utils/requireLogin'
import { getUserProfile, updateUserProfile } from '../services/userDb'
import { getKakaoProfile, updateKakaoProfile } from '../services/kakaoDb'
import {
  deleteDonor,
  listDonors,
  updateDonorFields,
} from '../services/donorRosterDb'
import { riskLabel } from '../utils/riskLabels'
import Badge from '../components/common/Badge'
import DonorDetailDrawer from '../components/daeho/DonorDetailDrawer'
import RestSuggestModal from '../components/daeho/RestSuggestModal'
import RestConfirmModal from '../components/daeho/RestConfirmModal'

function toDrawerRow(donor) {
  return {
    ...donor,
    row_index: donor.id,
  }
}

export default function JiyunPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const isKakao = user?.provider === 'kakao'

  const [profile, setProfile] = useState(null)
  const [bio, setBio] = useState('')
  const [profileStatus, setProfileStatus] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)

  const [donors, setDonors] = useState([])
  const [donorsLoading, setDonorsLoading] = useState(true)
  const [donorsError, setDonorsError] = useState('')
  const [sortByRisk, setSortByRisk] = useState(false)

  const [selected, setSelected] = useState(null)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      requireLogin(navigate, '/jiyun')
    }
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const load = isKakao ? getKakaoProfile : getUserProfile

    setProfileLoading(true)
    load(user.uid)
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        setBio(data?.bio ?? '')
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setProfileStatus('프로필을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, isKakao])

  const loadDonors = async () => {
    if (!user) return
    if (isKakao) {
      setDonors([])
      setDonorsLoading(false)
      setDonorsError('')
      return
    }
    setDonorsLoading(true)
    setDonorsError('')
    try {
      const rows = await listDonors(user)
      setDonors(rows)
    } catch (err) {
      console.error(err)
      setDonorsError(
        '기부자 명단을 불러오지 못했습니다. Firebase Console에서 firestore.rules를 배포했는지 확인해 주세요.',
      )
      setDonors([])
    } finally {
      setDonorsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadDonors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const visibleDonors = useMemo(() => {
    if (!sortByRisk) return donors
    return [...donors].sort(
      (a, b) => Number(b.probability ?? 0) - Number(a.probability ?? 0),
    )
  }, [donors, sortByRisk])

  const stats = useMemo(() => {
    const high = donors.filter((d) => d.risk_level === 'High').length
    const medium = donors.filter((d) => d.risk_level === 'Medium').length
    const low = donors.filter((d) => d.risk_level === 'Low').length
    return { total: donors.length, high, medium, low }
  }, [donors])

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }

  const patchDonorLocal = (donorId, patch) => {
    setDonors((prev) =>
      prev.map((d) => (d.id === donorId ? { ...d, ...patch } : d)),
    )
    setSelected((prev) =>
      prev && prev.id === donorId ? { ...prev, ...patch, row_index: donorId } : prev,
    )
  }

  const pushActionLog = async (donorId, label) => {
    const at = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const donor = donors.find((d) => d.id === donorId)
    const prevLogs = Array.isArray(donor?.actionLogs) ? donor.actionLogs : []
    const nextLogs = [{ id: `${Date.now()}-${label}`, label, at }, ...prevLogs].slice(
      0,
      8,
    )
    patchDonorLocal(donorId, { actionLogs: nextLogs })
    try {
      await updateDonorFields(user, donorId, { actionLogs: nextLogs })
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!user) return
    setProfileStatus('저장 중…')
    try {
      const save = isKakao ? updateKakaoProfile : updateUserProfile
      await save(user.uid, { bio })
      const load = isKakao ? getKakaoProfile : getUserProfile
      setProfile(await load(user.uid))
      setProfileStatus('저장되었습니다.')
    } catch (err) {
      console.error(err)
      setProfileStatus('저장에 실패했습니다.')
    }
  }

  const handleDelete = async (e, donorId) => {
    e.stopPropagation()
    if (!user) return
    if (!window.confirm('이 기부자를 명단에서 삭제할까요?')) return
    try {
      await deleteDonor(user, donorId)
      setDonors((prev) => prev.filter((d) => d.id !== donorId))
      if (selected?.id === donorId) {
        setSelected(null)
        setSuggestOpen(false)
        setConfirmOpen(false)
      }
    } catch (err) {
      console.error(err)
      alert('삭제에 실패했습니다.')
    }
  }

  const handleSendSms = () => {
    if (!selected?.phone) return
    showToast(`${selected.phone}로 문자 발송 요청을 접수했습니다.`)
    pushActionLog(selected.id, 'AI 문자 발송')
  }

  const handleSendEmail = () => {
    if (!selected?.email) return
    showToast(`${selected.email}로 이메일 발송 요청을 접수했습니다.`)
    pushActionLog(selected.id, 'AI 이메일 발송')
  }

  const handleSuggestRest = async ({ channel, months }) => {
    if (!selected || !user) return
    const id = selected.id
    const patch = {
      restSuggested: true,
      restMeta: {
        ...(selected.restMeta || {}),
        suggestedAt: Date.now(),
        suggestedChannel: channel,
        suggestedMonths: months,
      },
    }
    patchDonorLocal(id, patch)
    try {
      await updateDonorFields(user, id, patch)
    } catch (err) {
      console.error(err)
    }
    showToast('쉬어가기 제안을 발송했습니다.')
    pushActionLog(id, `쉬어가기 제안 (${channel}, ${months}개월)`)
    setSuggestOpen(false)
  }

  const handleConfirmRest = async ({ confirmedVia, months, note }) => {
    if (!selected || !user) return
    const id = selected.id
    const patch = {
      resting: true,
      restMeta: {
        ...(selected.restMeta || {}),
        months,
        confirmedVia,
        note,
      },
    }
    patchDonorLocal(id, patch)
    try {
      await updateDonorFields(user, id, patch)
    } catch (err) {
      console.error(err)
    }
    showToast('잠시 쉬어가기로 반영했습니다.')
    pushActionLog(id, `쉬어가기 요청 반영 (${confirmedVia}, ${months}개월)`)
    setConfirmOpen(false)
  }

  const handleResume = async () => {
    if (!selected || !user) return
    if (!window.confirm('후원을 다시 시작할까요?')) return
    const id = selected.id
    const patch = { resting: false }
    patchDonorLocal(id, patch)
    try {
      await updateDonorFields(user, id, patch)
    } catch (err) {
      console.error(err)
    }
    showToast('다시 시작했습니다.')
    pushActionLog(id, '다시 시작')
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-500">로그인 확인 중…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">마이페이지</h1>
          <p className="mt-1 text-sm text-slate-500">
            기부자 관리에서 예측한 명단이 여기에 쌓입니다. 행을 누르면 상세·후속 조치를
            할 수 있습니다.
          </p>
        </div>
        <Link
          to="/daeho"
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          기부자 관리로 이동
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">내 정보</h2>
        {profileLoading ? (
          <p className="mt-3 text-sm text-slate-400">불러오는 중…</p>
        ) : (
          <form onSubmit={handleSaveProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">이름</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {profile?.name || user?.name || '—'}
                {isKakao ? (
                  <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    카카오
                  </span>
                ) : null}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">이메일</p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {profile?.email || user?.email || '—'}
              </p>
            </div>
            <label className="block sm:col-span-2">
              <span className="text-xs text-slate-400">한 줄 소개</span>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="예: 기부 리텐션 담당"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                소개 저장
              </button>
              {profileStatus ? (
                <p className="text-xs text-slate-500">{profileStatus}</p>
              ) : null}
            </div>
          </form>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-4">
        {[
          { label: '전체 기부자', value: stats.total },
          { label: '고위험', value: stats.high, accent: true },
          { label: '주의', value: stats.medium },
          { label: '안정', value: stats.low },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs text-slate-400">{s.label}</p>
            <p
              className={`mt-1 text-2xl font-bold tabular-nums ${
                s.accent ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">내 기부자 명단</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSortByRisk((v) => !v)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                sortByRisk
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sortByRisk ? '위험도 높은 순 적용 중' : '위험도 높은 순'}
            </button>
            <button
              type="button"
              onClick={loadDonors}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              새로고침
            </button>
          </div>
        </div>

        {donorsError ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{donorsError}</p>
        ) : null}

        {isKakao ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            기부자 명단은 이메일(또는 Google) 로그인 계정에서 사용할 수 있습니다.
          </p>
        ) : donorsLoading ? (
          <p className="py-8 text-center text-sm text-slate-400">명단을 불러오는 중…</p>
        ) : visibleDonors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center">
            <p className="text-sm text-slate-500">아직 저장된 기부자가 없습니다.</p>
            <Link
              to="/daeho"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:underline"
            >
              기부자 관리에서 파일 업로드하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400">
                  <th className="px-2 py-2 font-medium">이름</th>
                  <th className="px-2 py-2 font-medium">이탈 가능성</th>
                  <th className="px-2 py-2 font-medium">위험도</th>
                  <th className="px-2 py-2 font-medium">추천 연락 경로</th>
                  <th className="px-2 py-2 font-medium">연락처</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {visibleDonors.map((d) => (
                  <tr
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(toDrawerRow(d))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(toDrawerRow(d))
                      }
                    }}
                    className={`cursor-pointer border-b border-slate-50 transition hover:bg-teal-50/50 ${
                      selected?.id === d.id ? 'bg-teal-50/70' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap px-2 py-3 font-medium text-slate-800">
                      <span className="inline-flex items-center gap-1.5">
                        {d.name || '—'}
                        {d.resting ? (
                          <Badge variant="warning">잠시 쉬어가는 중</Badge>
                        ) : null}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 tabular-nums font-semibold text-slate-900">
                      {d.probability_pct != null ? `${d.probability_pct}%` : '—'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3">
                      <Badge
                        variant={
                          d.risk_level === 'High'
                            ? 'danger'
                            : d.risk_level === 'Medium'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {riskLabel(d.risk_level)}
                      </Badge>
                    </td>
                    <td className="max-w-[12rem] truncate px-2 py-3 text-slate-600">
                      {d.recommended_channel || '—'}
                    </td>
                    <td className="px-2 py-3 text-xs text-slate-500">
                      <div>{d.email || '—'}</div>
                      <div>{d.phone || ''}</div>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, d.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <DonorDetailDrawer
        open={Boolean(selected)}
        row={selected}
        resting={Boolean(selected?.resting)}
        suggested={Boolean(selected?.restSuggested)}
        actionLogs={selected?.actionLogs || []}
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
