/**
 * DaehoPage — 기부자 관리 · 배치 스코어링 (로그인 필요)
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BatchScoringPanel from '../components/daeho/BatchScoringPanel'
import { useAuth } from '../context/AuthContext'
import { requireLogin } from '../utils/requireLogin'

export default function DaehoPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      requireLogin(navigate, '/daeho')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  return <BatchScoringPanel mode="full" isAuthenticated />
}
