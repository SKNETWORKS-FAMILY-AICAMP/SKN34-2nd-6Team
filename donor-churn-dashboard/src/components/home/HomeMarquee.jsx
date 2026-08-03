/**
 * HomeMarquee — 스크롤 연동 가로 스트립 (로컬 에셋·기능 카드)
 */
import { useEffect, useRef, useState } from 'react'

const ROW_A = [
  { type: 'image', src: '/hero-connection.png', alt: '연결' },
  { type: 'label', title: '기부자 관리', tone: 'from-teal-600 to-teal-800' },
  { type: 'image', src: '/logo_white.png', alt: 'doeep', dark: true },
  { type: 'label', title: '통계 및 솔루션', tone: 'from-slate-700 to-slate-900' },
  { type: 'image', src: '/hero-connection.png', alt: '커뮤니티' },
  { type: 'label', title: '모델 히스토리', tone: 'from-teal-700 to-cyan-900' },
  { type: 'image', src: '/logo_dark.png', alt: '두잎' },
]

const ROW_B = [
  { type: 'label', title: '이탈 예측', tone: 'from-rose-700 to-slate-900' },
  { type: 'image', src: '/logo_white.png', alt: 'doeep', dark: true },
  { type: 'label', title: '맞춤 솔루션', tone: 'from-teal-600 to-emerald-900' },
  { type: 'image', src: '/hero-connection.png', alt: '손길' },
  { type: 'label', title: '인구통계 분석', tone: 'from-slate-600 to-teal-900' },
  { type: 'image', src: '/logo_dark.png', alt: 'logo' },
]

function Tile({ item }) {
  if (item.type === 'label') {
    return (
      <div
        className={`flex h-[170px] w-[280px] shrink-0 items-end rounded-2xl bg-gradient-to-br p-5 sm:h-[200px] sm:w-[340px] md:h-[230px] md:w-[400px] ${item.tone}`}
      >
        <p className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {item.title}
        </p>
      </div>
    )
  }
  return (
    <div
      className={`h-[170px] w-[280px] shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-[200px] sm:w-[340px] md:h-[230px] md:w-[400px] ${
        item.dark ? 'bg-[#0B1220] p-10' : 'bg-slate-800'
      }`}
    >
      <img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        className={`h-full w-full ${item.dark ? 'object-contain' : 'object-cover'}`}
      />
    </div>
  )
}

function MarqueeRow({ items, direction }) {
  const sectionRef = useRef(null)
  const [offset, setOffset] = useState(0)
  const loop = [...items, ...items, ...items]

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      const next = (window.scrollY - top + window.innerHeight) * 0.28
      setOffset(next)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transform =
    direction === 'right'
      ? `translate3d(${offset - 180}px,0,0)`
      : `translate3d(${-(offset - 180)}px,0,0)`

  return (
    <div ref={sectionRef} className="overflow-hidden">
      <div className="flex gap-3" style={{ transform, willChange: 'transform' }}>
        {loop.map((item, i) => (
          <Tile key={`${item.title || item.src}-${i}`} item={item} />
        ))}
      </div>
    </div>
  )
}

export default function HomeMarquee() {
  return (
    <section className="overflow-x-clip bg-[#0B1220] pb-12 pt-20 sm:pb-16 sm:pt-28 md:pt-32">
      <div className="space-y-3">
        <MarqueeRow items={ROW_A} direction="right" />
        <MarqueeRow items={ROW_B} direction="left" />
      </div>
    </section>
  )
}
