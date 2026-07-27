/**
 * JeongseokPage — 정석 담당 페이지 (스텁)
 * 컴포넌트는 `src/components/jeongseok/` 에 추가하세요.
 */
import { Link } from 'react-router-dom'

export default function JeongseokPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">정석의 페이지</h1>
      <p className="text-slate-500">여기에 기능을 구현하세요.</p>
      <Link to="/" className="inline-block text-sm font-medium text-teal-700 hover:underline">
        ← 홈으로
      </Link>
    </div>
  )
}
