/**
 * LoginPage — mock 로그인 (추후 API 교체)
 */
//[refactor: [MLP-4] 코드 삭제] import { Link, useLocation, useNavigate } from 'react-router-dom'
//[refactor: [MLP-4] 코드 삭제] import { useAuth } from '../context/AuthContext'
import { useState } from 'react'                                      //[feat: [MLP-4] 기능 추가]
import { Link, useLocation, useNavigate } from 'react-router-dom'     //[feat: [MLP-4] 기능 추가]
import { useAuth } from '../context/AuthContext'                      //[feat: [MLP-4] 기능 추가]
import { getAuthErrorMessage } from '../utils/authErrors'             //[feat: [MLP-4] 기능 추가]


export default function LoginPage() {
  //[refactor: [MLP-4] 코드 변경] const { login } = useAuth()
  const { login, loginWithGoogle, loginWithKakao } = useAuth()        //[refactor: [MLP-4] 코드 변경]
  const navigate = useNavigate()
  const location = useLocation()
  //[refactor: [MLP-4] 코드 변경] const from = location.state?.from || '/daeho'
  const from = location.state?.from || '/'              //[refactor: [MLP-4] 코드 변경]
  const [email, setEmail] = useState('')                //[feat: [MLP-4] 기능 추가]
  const [password, setPassword] = useState('')          //[feat: [MLP-4] 기능 추가]
  const [error, setError] = useState('')                //[feat: [MLP-4] 기능 추가]
  const [submitting, setSubmitting] = useState(false)   //[feat: [MLP-4] 기능 추가]


  //[refactor: [MLP-4] 코드 변경]function handleSubmit(e) {
  //[refactor: [MLP-4] 코드 변경]  e.preventDefault()
  //[refactor: [MLP-4] 코드 변경]  login()
  //[refactor: [MLP-4] 코드 변경]  navigate(from, { replace: true })
  //[refactor: [MLP-4] 코드 변경]}


  //[refactor: [MLP-4] 코드 변경]
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err)
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }
  //

  //[feat: [MLP-4] 기능 추가]
  async function handleSocial(fn) {
    setError('')
    setSubmitting(true)
    try {
      await fn()
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err)
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }
  //

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
      {/* [refactor: [MLP-4] 코드 삭제] <label className="block space-y-1.5">
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

        */}
        {/*[feat: [MLP-4] 기능 추가]*/}
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">이메일</span>
          <input
            type="email"
            name="identifier"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="email@example.com"
          />
        </label>

        {/* */}


        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">비밀번호</span>
          <input
            type="password"
            name="password"
            value={password} // [feat: [MLP-4] 기능 추가]
            onChange={(e) => setPassword(e.target.value)} //[feat: [MLP-4] 기능 추가]
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="••••••••"
          />

        </label>


        {error && <p className="text-sm text-red-600">{error}</p>} {/* [feat: [MLP-4] 기능 추가] */} 

        <button
          type="submit"
          disabled={submitting}
          //[refactor: [MLP-4] 코드 변경] className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"*/}
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
        >
          로그인
        </button>

        {/*[refactor: [MLP-4] 코드 추가]*/} 
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          또는
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={() => handleSocial(loginWithGoogle)}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.85.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          Google로 계속하기
        </button>

        <button
          type="button"
          onClick={() => handleSocial(loginWithKakao)}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-4 py-2.5 text-sm font-medium text-[#191919] transition hover:brightness-95 disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#191919"
              d="M9 1.5C4.31 1.5.5 4.53.5 8.27c0 2.38 1.58 4.47 3.96 5.67-.17.63-.63 2.32-.72 2.68-.11.44.16.44.34.32.14-.1 2.24-1.52 3.15-2.14.57.08 1.16.13 1.77.13 4.69 0 8.5-3.03 8.5-6.77S13.69 1.5 9 1.5z"
            />
          </svg>
          카카오로 계속하기
        </button>
        {/* */}

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
