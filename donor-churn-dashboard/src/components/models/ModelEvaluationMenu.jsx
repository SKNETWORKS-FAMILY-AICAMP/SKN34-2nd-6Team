import { LayoutGrid } from 'lucide-react'
import { MODEL_EVALUATIONS } from './modelEvaluationData'

export default function ModelEvaluationMenu({ selectedId, onSelect }) {
  const groups = [
    {
      label: 'Overview',
      items: [{ id: 'all', name: '전체', icon: LayoutGrid }],
    },
    {
      label: 'Machine Learning',
      items: MODEL_EVALUATIONS.filter((model) => model.category === 'machine-learning'),
    },
    {
      label: 'Deep Learning',
      items: MODEL_EVALUATIONS.filter((model) => model.category === 'deep-learning'),
    },
  ]

  return (
    <nav aria-label="평가 모델 선택" className="min-w-0">
      <div
        role="tablist"
        aria-orientation="vertical"
        className="flex gap-4 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        {groups.map((group) => (
          <div key={group.label} className="flex shrink-0 gap-2 lg:flex-col">
            <p className="hidden px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:block">
              {group.label}
            </p>
            {group.items.map(({ id, name, icon: Icon, category }) => {
              const active = selectedId === id
              const deepLearning = category === 'deep-learning'
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelect(id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                    active
                      ? deepLearning
                        ? 'border-violet-200 bg-violet-50 text-violet-800 shadow-sm'
                        : 'border-teal-200 bg-teal-50 text-teal-800 shadow-sm'
                      : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  {name}
                  {category ? (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      deepLearning ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {deepLearning ? 'DL' : 'ML'}
                    </span>
                  ) : null}
                  {id === 'xgboost' ? (
                    <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-bold text-teal-700">
                      선택
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </nav>
  )
}
