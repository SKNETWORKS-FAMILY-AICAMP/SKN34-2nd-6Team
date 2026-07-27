/**
 * Badge — 상태/위험도 뱃지
 */
const VARIANTS = {
  brand: 'bg-teal-50 text-teal-800 ring-teal-600/20',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  danger: 'bg-rose-50 text-rose-800 ring-rose-600/20',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  critical: 'bg-rose-100 text-rose-900 ring-rose-700/30',
  high: 'bg-orange-50 text-orange-800 ring-orange-600/20',
  medium: 'bg-amber-50 text-amber-800 ring-amber-600/20',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${VARIANTS[variant] ?? VARIANTS.neutral} ${className}`}
    >
      {children}
    </span>
  )
}
