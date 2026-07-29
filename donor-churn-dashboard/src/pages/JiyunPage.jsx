/**
 * JiyunPage — 지윤 담당 페이지 (Firebase/카카오 프로필 CRUD + 활동 기록)
 *
 * 대상 경로: donor-churn-dashboard\src\pages\JiyunPage.jsx (전체 교체)
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requireLogin } from '../utils/requireLogin'
import { deleteUserProfile, ensureUserProfile, getUserProfile, updateUserProfile } from '../services/userDb'
import {
  deleteKakaoProfile,
  ensureKakaoProfile,
  getKakaoProfile,
  updateKakaoProfile,
} from '../services/kakaoDb'
import { getUserActivities, logActivity } from '../services/activityDb'

const TYPE_LABEL = {
  batch_scoring: '배치 스코어링',
  visualization_view: '시각화 조회',
  model_eval: '모델 평가',
  solution_view: '솔루션 도출',
  test: '테스트',
}

export default function JiyunPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const isKakao = user?.provider === 'kakao'

  const [profile, setProfile] = useState(null)
  const [bio, setBio] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const [activities, setActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  const getProfile = isKakao ? getKakaoProfile : getUserProfile
  const saveProfile = isKakao ? updateKakaoProfile : updateUserProfile
  const resetProfile = async (uid) => {
    if (isKakao) {
      await deleteKakaoProfile(uid)
      return ensureKakaoProfile(uid, { nickname: user.name, email: user.email })
    }
    await deleteUserProfile(uid)
    return ensureUserProfile(uid, { name: user.name, email: user.email })
  }

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      requireLogin(navigate, '/jiyun')
    }
  }, [authLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    getProfile(user.uid)
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        setBio(data?.bio ?? '')
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setStatus('프로필을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadActivities = async () => {
    if (!user || isKakao) return
    setActivitiesLoading(true)
    const data = await getUserActivities(user.uid)
    setActivities(data)
    setActivitiesLoading(false)
  }

  useEffect(() => {
    if (!user) return
    if (isKakao) {
      setActivitiesLoading(false)
      return
    }
    loadActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setStatus('저장 중...')
    await saveProfile(user.uid, { bio })
    const updated = await getProfile(user.uid)
    setProfile(updated)
    setStatus('저장되었습니다.')
  }

  const handleReset = async () => {
    setStatus('프로필 데이터를 초기화하는 중...')
    const recreated = await resetProfile(user.uid)
    setProfile(recreated)
    setBio('')
    setStatus('프로필 데이터가 초기화되었습니다.')
  }

  const handleAddTestActivity = async () => {
    await logActivity(user.uid, { type: 'test', summary: '테스트 활동 기록입니다.' })
    await loadActivities()
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">지윤의 페이지</h1>
        <p className="text-slate-500">로그인이 필요한 페이지입니다.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">지윤의 페이지</h1>
        <p className="text-slate-500">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">지윤의 페이지</h1>

      <form onSubmit={handleSave} className="space-y-3 max-w-sm">
        <p className="text-sm text-slate-500">
          {profile?.email} {isKakao && '(카카오)'}
        </p>

        <label className="block text-sm text-slate-700">
          이름
          <input
            type="text"
            value={profile?.name ?? ''}
            disabled
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-500"
          />
        </label>

        <label className="block text-sm text-slate-700">
          소개
          <input
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="한 줄 소개"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        {status && <p className="text-sm text-slate-500">{status}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            저장
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            프로필 데이터 초기화
          </button>
        </div>
      </form>

      <section className="max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">내 활동 기록</h2>
          {!isKakao && (
            <button
              type="button"
              onClick={handleAddTestActivity}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              테스트 활동 기록 추가
            </button>
          )}
        </div>

        {isKakao ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            카카오 로그인 사용자는 활동 기록 기능을 사용할 수 없습니다 (Firebase 인증 필요).
          </p>
        ) : activitiesLoading ? (
          <p className="text-sm text-slate-500">불러오는 중...</p>
        ) : activities.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            아직 활동 기록이 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                    {TYPE_LABEL[activity.type] ?? activity.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    {activity.createdAt?.toDate ? activity.createdAt.toDate().toLocaleString('ko-KR') : ''}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{activity.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/" className="inline-block text-sm font-medium text-teal-700 hover:underline">
        ← 홈으로
      </Link>
    </div>
  )
}
