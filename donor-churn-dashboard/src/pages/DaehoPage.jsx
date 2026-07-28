/**
 * DaehoPage — 기부자 관리 · 배치 스코어링 (로그인 필요)
 * TODO: 배포 전 로그인 가드 복구
 */
// import { useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
import BatchScoringPanel from '../components/daeho/BatchScoringPanel'
// import { useAuth } from '../context/AuthContext'
// import { requireLogin } from '../utils/requireLogin'

export default function DaehoPage() {
  // --- 로그인 가드 (나중에 복구) ---
  // const { isAuthenticated } = useAuth()
  // const navigate = useNavigate()
  //
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     requireLogin(navigate, '/daeho')
  //   }
  // }, [isAuthenticated, navigate])
  //
  // if (!isAuthenticated) return null
  //
  // return <BatchScoringPanel mode="full" isAuthenticated />
  // --- /로그인 가드 ---

  // 개발 중: 로그인 없이 전체 기능 사용
  return <BatchScoringPanel mode="full" isAuthenticated />
}
