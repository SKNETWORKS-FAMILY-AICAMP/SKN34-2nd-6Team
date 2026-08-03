/**
 * HomeAbout — 라운드 전환 + 소개 카피
 */
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import FadeIn from './FadeIn'

export default function HomeAbout({ isAuthenticated }) {
  return (
    <section className="relative z-10 -mt-6 rounded-t-[40px] bg-white px-4 py-20 sm:-mt-8 sm:rounded-t-[50px] sm:px-6 sm:py-24 md:-mt-10 md:rounded-t-[60px] md:py-28">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            About doeep
          </p>
          <h2 className="home-hero-heading font-display mt-4 text-[clamp(2.5rem,8vw,5.5rem)] font-black uppercase leading-none tracking-tight">
            두잎
          </h2>
        </FadeIn>

        <FadeIn delay={0.12} className="mt-10 sm:mt-14">
          <p className="max-w-[34rem] text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
            기부 활동의 흐름이 이어지도록, 우리는 이탈 가능성을 먼저 읽고 관계를
            지키는 행동을 돕습니다. 예측·통계·솔루션을 한곳에서 이어, 기부 문화에
            다시 참여할 수 있는 길을 만듭니다.
          </p>
        </FadeIn>

        <FadeIn delay={0.22} className="mt-14 sm:mt-20">
          <Link
            to={isAuthenticated ? '/daeho' : '/signup'}
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-teal-700"
          >
            {isAuthenticated ? '기부자 관리 시작' : '함께 시작하기'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
