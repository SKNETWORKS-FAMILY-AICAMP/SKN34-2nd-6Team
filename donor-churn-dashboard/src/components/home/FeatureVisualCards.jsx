/**
 * FeatureVisualCards — 홈 「우리가 하는 일」 비주얼 카드
 * hover 시 카드별 미리보기(영상/GIF) 재생, 클릭 시 해당 페이지로 이동
 * 컨셉 그린: #52755D #0CC769 #2DA166 #076625 #1AB836
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BrainCircuit, Check, User } from 'lucide-react'
import { FEATURE_LINKS } from '../../data/featureLinks'

const C = {
  muted: '#52755D',
  vivid: '#0CC769',
  primary: '#2DA166',
  forest: '#076625',
  leaf: '#1AB836',
}

const HOME_CARDS = [
  {
    id: 'donors',
    tagline: '파일을 올리면 이탈 위험을 한눈에 볼 수 있습니다.',
    art: 'donors',
    preview: '/features/donors-preview.gif',
    previewType: 'image',
  },
  {
    id: 'insights',
    tagline: '인구통계별로 이탈 패턴과 대응을 확인합니다.',
    art: 'stats',
    preview: '/features/insights-preview.gif',
    previewType: 'image',
  },
  {
    id: 'models',
    tagline: '어떤 모델을 왜 골랐는지 비교해 볼 수 있습니다.',
    art: 'model',
    preview: '/features/models-preview.gif',
    previewType: 'image',
  },
]

function DonorArt() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center px-6 py-8"
      style={{
        background: `linear-gradient(180deg, ${C.vivid}22 0%, ${C.primary}14 40%, #ffffff 100%)`,
      }}
    >
      <div className="w-full max-w-[200px] rounded-2xl border border-white/80 bg-white p-4 shadow-[0_12px_40px_rgba(7,102,37,0.12)]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex items-center gap-3 ${i > 0 ? 'mt-3 border-t border-slate-100 pt-3' : ''}`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: C.forest }}
            >
              <User className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <span className="h-2 flex-1 rounded-full bg-slate-200/90" />
            <Check className="h-4 w-4 shrink-0" style={{ color: C.primary }} strokeWidth={2.5} />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatsArt() {
  const bars = [
    { h: 38, c: C.leaf },
    { h: 58, c: C.primary },
    { h: 46, c: C.vivid },
    { h: 78, c: C.forest },
    { h: 64, c: C.primary },
  ]
  return (
    <div
      className="relative flex h-full w-full items-end justify-center px-8 pb-8 pt-10"
      style={{
        background: `linear-gradient(180deg, ${C.vivid}22 0%, ${C.primary}14 40%, #ffffff 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-6 inset-y-8 opacity-35"
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 17px, ${C.muted}33 17px, ${C.muted}33 18px)`,
        }}
        aria-hidden
      />
      <div className="relative z-10 flex h-[70%] w-full max-w-[220px] items-end justify-between gap-2.5">
        {bars.map((b, i) => (
          <div
            key={i}
            className="w-full rounded-t-md shadow-sm"
            style={{ height: `${b.h}%`, backgroundColor: b.c }}
          />
        ))}
      </div>
    </div>
  )
}

function ModelArt() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center px-6 py-8"
      style={{
        background: `linear-gradient(160deg, ${C.vivid}28 0%, ${C.primary}12 45%, #ffffff 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(${C.muted}26 1px, transparent 1px), linear-gradient(90deg, ${C.muted}26 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
        }}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-[210px]">
        <div
          className="absolute -right-2 top-3 h-[78%] w-full rounded-2xl border bg-white/70 shadow-sm"
          style={{ borderColor: `${C.primary}33` }}
        />
        <div
          className="absolute -right-1 top-1.5 h-[86%] w-full rounded-2xl border bg-white/85 shadow-sm"
          style={{ borderColor: `${C.primary}40` }}
        />
        <div
          className="relative rounded-2xl border bg-white p-4 shadow-[0_12px_32px_rgba(7,102,37,0.14)]"
          style={{ borderColor: `${C.primary}33` }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: C.forest }}
            >
              <BrainCircuit className="h-5 w-5" />
            </span>
            <span className="h-2.5 flex-1 rounded-full bg-slate-200" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-2 w-[88%] rounded-full" style={{ backgroundColor: C.forest }} />
            <div className="h-2 w-[64%] rounded-full" style={{ backgroundColor: C.primary }} />
            <div className="h-2 w-[46%] rounded-full" style={{ backgroundColor: C.leaf }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Art({ type }) {
  if (type === 'donors') return <DonorArt />
  if (type === 'stats') return <StatsArt />
  return <ModelArt />
}

function FeatureCard({ card }) {
  const [playing, setPlaying] = useState(false)
  const [playKey, setPlayKey] = useState(0)

  return (
    <li>
      <Link
        to={card.path}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#2DA166]/50 hover:shadow-[0_16px_40px_rgba(7,102,37,0.14)]"
        onMouseEnter={() => {
          setPlaying(true)
          setPlayKey((k) => k + 1)
        }}
        onMouseLeave={() => setPlaying(false)}
        onFocus={() => {
          setPlaying(true)
          setPlayKey((k) => k + 1)
        }}
        onBlur={() => setPlaying(false)}
      >
        <div className="relative aspect-[5/4] w-full overflow-hidden bg-slate-50 sm:aspect-[4/3]">
          {playing ? (
            <img
              key={playKey}
              src={card.preview}
              alt={`${card.name} 미리보기`}
              className="absolute inset-0 h-full w-full object-cover object-top"
              draggable={false}
            />
          ) : (
            <Art type={card.art} />
          )}
        </div>
        <div className="flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-6">
          <h3
            className="text-lg font-bold tracking-tight sm:text-xl"
            style={{ color: C.forest }}
          >
            {card.name}
          </h3>
          <p
            className="mt-2 text-sm leading-relaxed sm:text-[0.95rem]"
            style={{ color: C.muted }}
          >
            {card.tagline}
          </p>
        </div>
      </Link>
    </li>
  )
}

export default function FeatureVisualCards() {
  const cards = HOME_CARDS.map((card) => {
    const link = FEATURE_LINKS.find((f) => f.id === card.id)
    return { ...card, name: link?.name ?? card.id, path: link?.path ?? '/' }
  })

  return (
    <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <FeatureCard key={card.id} card={card} />
      ))}
    </ul>
  )
}
