/**
 * App.jsx — 라우트 정의만 담당 (얇게 유지)
 */
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DonorsPage from './pages/DonorsPage'
import InsightsPage from './pages/InsightsPage'
import ModelsPage from './pages/ModelsPage'
import MyPage from './pages/MyPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/donors" element={<DonorsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/models" element={<ModelsPage />} />
            <Route path="/mypage" element={<MyPage />} />
            {/* 구 경로 호환 */}
            <Route path="/daeho" element={<Navigate to="/donors" replace />} />
            <Route path="/jeongseok" element={<Navigate to="/insights" replace />} />
            <Route path="/hosun" element={<Navigate to="/models" replace />} />
            <Route path="/jiyun" element={<Navigate to="/mypage" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
