/**
 * DonorsPage — 기부자 관리 · 배치 스코어링 (로그인 필요)
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BatchScoringPanel from '../components/donors/BatchScoringPanel'
import { useAuth } from '../context/AuthContext'
import { requireLogin } from '../utils/requireLogin'

export default function DonorsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      requireLogin(navigate, '/donors')
    }
  }, [authLoading, isAuthenticated, navigate])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-slate-500">로그인 확인 중…</p>
      </div>
    )
  }

  return <BatchScoringPanel mode="full" isAuthenticated />
}
