/**
 * HomePage — doeep 랜딩 (모던 리디자인 실험)
 * 롤백: 「원래대로 복귀」 시 HomePage + home/* + AppLayout/index.css/index.html 원복
 */
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import BatchScoringPanel from '../components/daeho/BatchScoringPanel'
import JeongseokPreviewPanel from '../components/jeongseok/JeongseokPreviewPanel'
import HomeHero from '../components/home/HomeHero'
import HomeMarquee from '../components/home/HomeMarquee'
import HomeAbout from '../components/home/HomeAbout'
import HomeFeatureStack from '../components/home/HomeFeatureStack'
import FadeIn from '../components/home/FadeIn'
import { useAuth } from '../context/AuthContext'
import { requireLogin } from '../utils/requireLogin'

function PreviewFooter({ isAuthenticated, onRequireLogin, to, label }) {
  if (isAuthenticated) {
    return (
      <div className="mt-6">
        <Link
          to={to}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
        >
          {label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onRequireLogin}
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
      >
        로그인하고 전체 기능 사용하기
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const handleRequireLogin = () => requireLogin(navigate, '/')

  return (
    <div className="overflow-x-clip">
      <HomeHero isAuthenticated={isAuthenticated} />
      <HomeMarquee />
      <HomeAbout isAuthenticated={isAuthenticated} />
      <HomeFeatureStack />

      {/* Batch scoring preview — 기능 유지 */}
      <section
        id="preview"
        className="scroll-mt-24 relative z-10 -mt-8 rounded-t-[40px] border-t border-slate-200 bg-slate-50 px-4 py-16 sm:-mt-10 sm:rounded-t-[50px] sm:px-6 sm:py-20 md:rounded-t-[60px]"
      >
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-8 max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Preview
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                기부자 관리 미리보기
              </h2>
              <p className="text-sm text-slate-500 sm:text-base">
                {isAuthenticated
                  ? '전체 기능은 기부자 관리 페이지에서 사용할 수 있습니다.'
                  : '로그인 후 전체 기능을 사용할 수 있습니다.'}
              </p>
            </div>
          </FadeIn>
          <BatchScoringPanel
            mode="preview"
            isAuthenticated={isAuthenticated}
            onRequireLogin={handleRequireLogin}
          />
          <PreviewFooter
            isAuthenticated={isAuthenticated}
            onRequireLogin={handleRequireLogin}
            to="/daeho"
            label="전체 기능으로 이동"
          />
        </div>
      </section>

      {/* Jeongseok solutions preview — 기능 유지 */}
      <section
        id="solutions-preview"
        className="scroll-mt-24 border-t border-slate-200 bg-white px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="mb-8 max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Preview
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                통계 및 솔루션 미리보기
              </h2>
              <p className="text-sm text-slate-500 sm:text-base">
                {isAuthenticated
                  ? '전체 기능은 통계 및 솔루션 페이지에서 사용할 수 있습니다.'
                  : '로그인 후 전체 기능을 사용할 수 있습니다.'}
              </p>
            </div>
          </FadeIn>
          <JeongseokPreviewPanel
            isAuthenticated={isAuthenticated}
            onRequireLogin={handleRequireLogin}
          />
          <PreviewFooter
            isAuthenticated={isAuthenticated}
            onRequireLogin={handleRequireLogin}
            to="/jeongseok"
            label="전체 기능으로 이동"
          />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#0B1220] px-4 py-14 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="max-w-xl text-sm text-slate-300 sm:text-base">
            기부 이탈을 줄이고, 기부 문화 참여를 이어 가는 여정에 함께해 주세요.
          </p>
          <Link
            to="/signup"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
