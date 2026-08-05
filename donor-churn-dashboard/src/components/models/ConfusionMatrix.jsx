const CELL_DESCRIPTIONS = [
  ['정상 분류', '오탐'],
  ['미탐', '이탈 탐지'],
]

function cellBackground(value) {
  const opacity = 0.1 + (value / 100) * 0.78
  return `rgba(13, 148, 136, ${opacity.toFixed(3)})`
}

export default function ConfusionMatrix({ matrix, modelName }) {
  if (!matrix?.values?.length) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">혼동행렬</h2>
        <p className="mt-4 rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-400">
          노트북에서 혼동행렬 값을 확인할 수 없습니다.
        </p>
      </section>
    )
  }

  const [stableLabel, churnLabel] = matrix.labels
  const missedChurn = matrix.values[1][0]
  const detectedChurn = matrix.values[1][1]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">혼동행렬</h2>
      <p className="mt-1 text-xs text-slate-500">
        세로축 실제 · 가로축 예측 · 각 실제 클래스 행 기준 비율
      </p>

      <div
        className="mt-5 w-full"
        role="img"
        aria-label={`${modelName} 혼동행렬. 행은 실제 클래스, 열은 예측 클래스이며 행 기준 백분율입니다.`}
      >
        <div className="grid w-full grid-cols-[52px_repeat(2,minmax(0,1fr))] gap-1.5 sm:grid-cols-[64px_repeat(2,minmax(0,1fr))] sm:gap-2">
          <div />
          <div className="pb-1 text-center text-[11px] font-semibold text-slate-500">
            예측 {stableLabel}
          </div>
          <div className="pb-1 text-center text-[11px] font-semibold text-slate-500">
            예측 {churnLabel}
          </div>

          {matrix.values.map((row, rowIndex) => (
            <MatrixRow
              key={matrix.labels[rowIndex]}
              row={row}
              rowIndex={rowIndex}
              actualLabel={matrix.labels[rowIndex]}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Insight
          label="이탈 탐지"
          value={detectedChurn}
          description="실제 이탈자를 이탈로 올바르게 예측"
          accent
        />
        <Insight
          label="이탈 미탐"
          value={missedChurn}
          description="실제 이탈자를 비이탈로 놓친 비율"
        />
      </div>

      {modelName === 'XGBoost' ? (
        <p className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-xs leading-5 text-teal-800">
          XGBoost는 실제 이탈자의 <strong>{detectedChurn.toFixed(1)}%</strong>를 탐지하고,
          {' '}<strong>{missedChurn.toFixed(1)}%</strong>를 놓쳤습니다.
        </p>
      ) : modelName === 'Gradient Boosting' ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
          전체 정확도는 높지만 실제 이탈자의 <strong>{missedChurn.toFixed(1)}%</strong>를
          비이탈로 판단해 이탈 재현율이 낮습니다.
        </p>
      ) : null}

    </section>
  )
}

function MatrixRow({ row, rowIndex, actualLabel }) {
  return (
    <>
      <div className="flex items-center justify-end pr-1 text-right text-[11px] font-semibold text-slate-500">
        실제 {actualLabel}
      </div>
      {row.map((value, columnIndex) => {
        const description = CELL_DESCRIPTIONS[rowIndex][columnIndex]
        const dark = value >= 55
        const predictedLabel = columnIndex === 0 ? '비이탈' : '이탈'
        return (
          <div
            key={`${actualLabel}-${predictedLabel}`}
            aria-label={`실제 ${actualLabel}을 예측 ${predictedLabel}로 분류: ${description}, ${value.toFixed(1)}퍼센트`}
            className={`flex min-h-20 min-w-0 flex-col items-center justify-center rounded-lg border border-teal-100 p-1.5 sm:min-h-24 sm:p-2 ${
              dark ? 'text-white' : 'text-slate-800'
            }`}
            style={{ backgroundColor: cellBackground(value) }}
          >
            <strong className="text-base sm:text-xl">{value.toFixed(1)}%</strong>
            <span className={`mt-1 break-keep text-center text-[9px] font-medium sm:text-[10px] ${dark ? 'text-white/80' : 'text-slate-600'}`}>
              {description}
            </span>
          </div>
        )
      })}
    </>
  )
}

function Insight({ label, value, description, accent = false }) {
  return (
    <div className={`rounded-lg p-3 ${accent ? 'bg-teal-50' : 'bg-rose-50'}`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-xs font-semibold ${accent ? 'text-teal-800' : 'text-rose-800'}`}>
          {label}
        </p>
        <strong className={accent ? 'text-teal-700' : 'text-rose-700'}>{value.toFixed(1)}%</strong>
      </div>
      <p className={`mt-1 text-[10px] ${accent ? 'text-teal-600' : 'text-rose-600'}`}>
        {description}
      </p>
    </div>
  )
}
