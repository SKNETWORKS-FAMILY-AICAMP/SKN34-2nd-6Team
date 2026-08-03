/**
 * App.jsx — 라우트 정의만 담당 (얇게 유지)
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DaehoPage from './pages/DaehoPage'
import JeongseokPage from './pages/JeongseokPage'
import HosunPage from './pages/HosunPage'
import JiyunPage from './pages/JiyunPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/daeho" element={<DaehoPage />} />
            <Route path="/jeongseok" element={<JeongseokPage />} />
            <Route path="/hosun" element={<HosunPage />} />
            <Route path="/jiyun" element={<JiyunPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
