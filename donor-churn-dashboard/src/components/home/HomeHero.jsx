/**
 * HomeHero — 다크 풀뷰포트 히어로 (doeep 브랜드 강조)
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export default function HomeHero({ isAuthenticated }) {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-x-clip bg-[#0B1220] text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_20%,rgba(13,148,136,0.28),transparent_55%),radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(45,212,191,0.12),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <div className="mt-2 overflow-hidden sm:mt-4 md:mt-6">
          <motion.h1
            className="home-hero-heading font-display w-full text-center text-[clamp(2.75rem,11vw,7.5rem)] font-black uppercase leading-none tracking-tight"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            doeep
          </motion.h1>
        </div>

        <div className="mt-auto grid gap-8 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end lg:gap-12">
          <div className="max-w-xl space-y-6">
            <motion.p
              className="font-display text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl md:text-4xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.7 }}
            >
              기부 이탈을 예측하고,
              <br />
              기부 문화 참여를 이어갑니다
            </motion.p>
            <motion.p
              className="max-w-md text-sm leading-relaxed text-slate-300 sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              이탈 위험을 먼저 읽고, 맞춤 솔루션으로 관계를 이어 갑니다. 예측에서
              예방까지 — doeep가 기부 여정을 함께합니다.
            </motion.p>
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.7 }}
            >
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                기능 살펴보기
                <ArrowDown className="h-4 w-4" />
              </a>
              {!isAuthenticated ? (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
                >
                  회원가입
                </Link>
              ) : (
                <a
                  href="#preview"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
                >
                  미리보기 보기
                </a>
              )}
            </motion.div>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[36px]"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.85 }}
          >
            <img
              src="/hero-connection.png"
              alt="기부 커뮤니티의 따뜻한 연결을 상징하는 이미지"
              className="aspect-[4/3] w-full object-cover object-[70%_center] sm:aspect-[16/11]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#0B1220]/55 via-transparent to-teal-500/10"
              aria-hidden
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
