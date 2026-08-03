/**
 * HomeFeatureStack — 주요 기능 3개 스티키 스택 카드
 */
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const CARDS = [
  {
    id: 'daeho',
    no: '01',
    name: '기부자 관리',
    category: 'Predict',
    teaser: '일괄 이탈 예측과 고위험 기부자 후속 액션을 한 화면에서 관리합니다.',
    path: '/daeho',
    image: '/hero-connection.png',
  },
  {
    id: 'jeongseok',
    no: '02',
    name: '통계 및 솔루션',
    category: 'Insight',
    teaser: '인구통계별 이탈 패턴을 보고, 맞춤 솔루션으로 바로 이어집니다.',
    path: '/jeongseok',
    image: '/logo_dark.png',
  },
  {
    id: 'hosun',
    no: '03',
    name: '모델 히스토리',
    category: 'Model',
    teaser: '모델 선별 과정과 평가 지표를 투명하게 살펴봅니다.',
    path: '/hosun',
    image: '/logo_white.png',
  },
]

function StackCard({ card, index, total, progress }) {
  const targetScale = 1 - (total - 1 - index) * 0.035
  const scale = useTransform(progress, [index / total, 1], [1, targetScale])

  return (
    <div className="sticky h-[78vh] sm:h-[82vh]" style={{ top: `calc(5.5rem + ${index * 22}px)` }}>
      <motion.article
        style={{ scale }}
        className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-[32px] border-2 border-slate-200 bg-[#0B1220] p-5 text-white shadow-2xl sm:rounded-[44px] sm:p-7 md:rounded-[52px] md:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
              {card.category}
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <span className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-none">
                {card.no}
              </span>
              <h3 className="pb-1 font-display text-xl font-semibold sm:text-2xl md:text-3xl">
                {card.name}
              </h3>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
              {card.teaser}
            </p>
          </div>
          <Link
            to={card.path}
            className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-100 transition hover:bg-white/10 sm:text-sm"
          >
            바로가기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          className={`mt-6 flex-1 overflow-hidden rounded-[24px] sm:rounded-[32px] ${
            card.id === 'hosun' ? 'bg-teal-900/40 p-10' : 'bg-slate-800'
          }`}
        >
          <img
            src={card.image}
            alt=""
            className={`h-full w-full ${
              card.id === 'daeho' ? 'object-cover object-center' : 'object-contain'
            }`}
          />
        </div>
      </motion.article>
    </div>
  )
}

export default function HomeFeatureStack() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return (
    <section
      id="projects"
      ref={ref}
      className="scroll-mt-24 relative z-10 -mt-8 rounded-t-[40px] bg-[#0B1220] px-4 pb-24 pt-16 sm:-mt-10 sm:rounded-t-[50px] sm:px-6 sm:pb-28 sm:pt-20 md:-mt-12 md:rounded-t-[60px]"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="home-hero-heading font-display text-center text-[clamp(2.5rem,8vw,5.5rem)] font-black uppercase leading-none tracking-tight">
          Project
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-center text-sm text-slate-400 sm:text-base">
          핵심 기능 세 가지를 스크롤하며 살펴보세요.
        </p>

        <div className="mt-12 space-y-6 sm:mt-16">
          {CARDS.map((card, index) => (
            <StackCard
              key={card.id}
              card={card}
              index={index}
              total={CARDS.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
