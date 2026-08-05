import { Leaf } from 'lucide-react'

const COINS = [
  { left: '30px', delay: '0s' },
  { left: '53px', delay: '0.4s' },
  { left: '76px', delay: '0.8s' },
]

export default function DonationDropLoader({
  label = '기부금 데이터를 두잎 기부함에 정리하고 있어요...',
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <div className="donation-loader" role="status" aria-label="분석 중">
        <div className="donation-loader__glow" />
        {COINS.map((coin, i) => (
          <span
            key={i}
            className="donation-loader__coin"
            style={{ left: coin.left, animationDelay: coin.delay }}
          >
            ₩
          </span>
        ))}
        <div className="donation-loader__box">
          <div className="donation-loader__slot" />
          <Leaf className="donation-loader__leaf" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}
