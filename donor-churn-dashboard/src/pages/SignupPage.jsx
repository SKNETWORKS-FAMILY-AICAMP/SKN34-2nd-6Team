/**
 * SignupPage — 회원가입 UI 골격 (인증 로직 미구현)
 */
import { Link } from 'react-router-dom'

export default function SignupPage() {
  function handleSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = form.get('password')
    const passwordConfirm = form.get('passwordConfirm')

    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    // TODO: 회원가입 API 연동
    console.log('signup submit (placeholder)')
    alert('회원가입 기능은 아직 준비 중입니다.')
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">회원가입</h1>
        <p className="text-sm text-slate-500">새 계정을 만들어 주세요.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">이름</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="홍길동"
          />
        </label>

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
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="••••••••"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">비밀번호 확인</span>
          <input
            type="password"
            name="passwordConfirm"
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          회원가입
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        이미 계정이 있나요?{' '}
        <Link to="/login" className="font-medium text-teal-700 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  )
}
