/**
 * LoginPage — mock 로그인 (추후 API 교체)
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/daeho'

  function handleSubmit(e) {
    e.preventDefault()
    login()
    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">로그인</h1>
        <p className="text-sm text-slate-500">계정으로 로그인해 주세요.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">이메일 / 아이디</span>
          <input
            type="text"
            name="identifier"
            required
            autoComplete="username"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="email@example.com"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">비밀번호</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          로그인
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        계정이 없나요?{' '}
        <Link to="/signup" className="font-medium text-teal-700 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  )
}
