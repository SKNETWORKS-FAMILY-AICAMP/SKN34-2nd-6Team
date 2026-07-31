import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = {
  churn: '#e11d48',
  retained: '#0d9488',
  male: '#2563eb',
  female: '#ec4899',
}

const MARITAL_COLORS = ['#f43f5e', '#f97316', '#8b5cf6', '#0ea5e9']

const PROFILE_KEYS = {
  age: '연령',
  gender: '성별',
  education: '최종 학력',
  religion: '종교',
  employment: '고용 상태',
  children: '자녀 유무',
  income: '월평균 가구소득 (원, 세전)',
  marital: '혼인 상태',
}

const LABELS = {
  gender: { 1: '남성', 2: '여성' },
  education: {
    1: '초졸 이하',
    2: '중졸 이하',
    3: '고졸 이하',
    4: '대졸 이하',
    5: '대학원 이상',
    6: '기타 학력',
  },
  religion: {
    1: '기독교',
    2: '불교',
    3: '천주교',
    4: '원불교',
    9997: '기타',
    9998: '없음',
  },
  employment: {
    1: '상용근로자',
    2: '임시근로자',
    3: '일용근로자',
    4: '자영업자',
    5: '학생',
    6: '주부',
    7: '실업/미취업',
    8: '퇴직',
  },
  children: { 1: '자녀 있음', 2: '자녀 없음' },
  marital: { 1: '미혼', 2: '기혼', 3: '별거/이혼/사별' },
}

const RELIGION_ICONS = {
  기독교: '✝',
  불교: '☸',
  천주교: '✟',
  원불교: '◉',
  기타: '◇',
  없음: '∅',
}

function numberValue(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function ageGroup(value) {
  const age = numberValue(value)
  if (age == null) return '미상'
  if (age < 20) return '20세 미만'
  if (age >= 70) return '70세 이상'
  return `${Math.floor(age / 10) * 10}대`
}

function incomeGroup(value) {
  const raw = numberValue(value)
  if (raw == null) return '미상'
  const won = raw > 0 && raw < 100_000 ? raw * 10_000 : raw
  if (won < 2_000_000) return '200만원 미만'
  if (won < 4_000_000) return '200~400만원'
  if (won < 6_000_000) return '400~600만원'
  if (won < 8_000_000) return '600~800만원'
  return '800만원 이상'
}

function mappedGroup(value, labels) {
  if (value == null || value === '') return '미상'
  return labels[String(value)] || `기타(${String(value)})`
}

function aggregateBy(rows, threshold, profileKey, groupResolver) {
  const groups = new Map()

  rows.forEach((row) => {
    const group = groupResolver(row.profile?.[profileKey])
    const current = groups.get(group) || {
      group,
      total: 0,
      churn: 0,
      probabilitySum: 0,
    }
    current.total += 1
    current.churn += row.probability >= threshold ? 1 : 0
    current.probabilitySum += Number(row.probability) || 0
    groups.set(group, current)
  })

  return [...groups.values()].map((item) => ({
    group: item.group,
    total: item.total,
    churn: item.churn,
    retained: item.total - item.churn,
    churnRate: Number(((item.churn / item.total) * 100).toFixed(1)),
    retainedRate: Number(
      (((item.total - item.churn) / item.total) * 100).toFixed(1),
    ),
    averageProbability: Number(
      ((item.probabilitySum / item.total) * 100).toFixed(1),
    ),
  }))
}

function buildPopulationPyramid(rows, threshold) {
  const groups = new Map()

  rows.forEach((row) => {
    const gender = mappedGroup(row.profile?.[PROFILE_KEYS.gender], LABELS.gender)
    if (gender !== '남성' && gender !== '여성') return

    const age = ageGroup(row.profile?.[PROFILE_KEYS.age])
    const current = groups.get(age) || {
      age,
      maleTotal: 0,
      maleChurn: 0,
      femaleTotal: 0,
      femaleChurn: 0,
    }
    const isChurn = row.probability >= threshold
    if (gender === '남성') {
      current.maleTotal += 1
      current.maleChurn += isChurn ? 1 : 0
    } else {
      current.femaleTotal += 1
      current.femaleChurn += isChurn ? 1 : 0
    }
    groups.set(age, current)
  })

  return [...groups.values()]
    .map((item) => {
      const maleRate = item.maleTotal
        ? Number(((item.maleChurn / item.maleTotal) * 100).toFixed(1))
        : 0
      const femaleRate = item.femaleTotal
        ? Number(((item.femaleChurn / item.femaleTotal) * 100).toFixed(1))
        : 0
      return {
        ...item,
        maleRate: -maleRate,
        femaleRate,
      }
    })
    .sort(
      (a, b) =>
        Number.parseInt(a.age, 10) - Number.parseInt(b.age, 10),
    )
}

export default function ChurnVisualizationDashboard({ batch }) {
  const rows = batch?.results ?? []
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
        시각화할 예측 데이터가 없습니다.
      </div>
    )
  }

  const threshold = Number(batch.threshold) || 0.55
  const churnCount = rows.filter((row) => row.probability >= threshold).length
  const retainedCount = rows.length - churnCount
  const churnShare = [
    { name: '이탈', value: churnCount, color: COLORS.churn },
    { name: '비이탈', value: retainedCount, color: COLORS.retained },
  ]

  const populationData = buildPopulationPyramid(rows, threshold)

  const religionData = aggregateBy(
    rows,
    threshold,
    PROFILE_KEYS.religion,
    (value) => mappedGroup(value, LABELS.religion),
  )

  const childrenData = aggregateBy(
    rows,
    threshold,
    PROFILE_KEYS.children,
    (value) => mappedGroup(value, LABELS.children),
  )

  const incomeOrder = [
    '200만원 미만',
    '200~400만원',
    '400~600만원',
    '600~800만원',
    '800만원 이상',
    '미상',
  ]
  const incomeData = aggregateBy(
    rows,
    threshold,
    PROFILE_KEYS.income,
    incomeGroup,
  ).sort(
    (a, b) =>
      incomeOrder.indexOf(a.group) - incomeOrder.indexOf(b.group),
  )

  const educationData = aggregateBy(
    rows,
    threshold,
    PROFILE_KEYS.education,
    (value) => mappedGroup(value, LABELS.education),
  )

  const employmentData = aggregateBy(
    rows,
    threshold,
    PROFILE_KEYS.employment,
    (value) => mappedGroup(value, LABELS.employment),
  ).sort((a, b) => b.churnRate - a.churnRate)

  const maritalData = aggregateBy(
    rows,
    threshold,
    PROFILE_KEYS.marital,
    (value) => mappedGroup(value, LABELS.marital),
  )

  return (
    <section className="space-y-6" aria-labelledby="dashboard-title">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
          ChurnVisualizationDashboard
        </p>
        <h2 id="dashboard-title" className="mt-1 text-xl font-bold text-slate-900">
          이탈 예측 시각화 대시보드
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          예측 확률 {(threshold * 100).toFixed(0)}% 이상을 이탈로 분류했습니다.
          막대 위 수치는 각 그룹의 이탈률입니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="분석 모델" value={batch.model_name} />
        <Stat label="전체 기부자" value={`${rows.length}명`} />
        <Stat label="예측 이탈" value={`${churnCount}명`} accent />
        <Stat
          label="전체 이탈률"
          value={`${((churnCount / rows.length) * 100).toFixed(1)}%`}
          accent
        />
      </div>

      <div>
        <ChartCard title="전체 이탈률" description="모델 임계값 기준 이탈 vs 비이탈 비율">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={churnShare}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={88}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
              >
                {churnShare.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}명`, '인원']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <PopulationPyramidChart data={populationData} />

      <EducationBookChart data={educationData} />

      <EmploymentHorizontalBarChart data={employmentData} />

      <MaritalPieChart data={maritalData} />

      <ChildrenDonutChart data={childrenData} />

      <IncomeStackedChart data={incomeData} />

      <ReligionIconPlot data={religionData} />
    </section>
  )
}

function PopulationPyramidChart({ data }) {
  return (
    <ChartCard
      title="연령대·성별 이탈률"
      description="기타 성별 응답을 제외하고 남성은 왼쪽, 여성은 오른쪽에 표시합니다."
      height={360}
    >
      {data.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            stackOffset="sign"
            margin={{ top: 20, right: 50, left: 30, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[-100, 100]}
              tickFormatter={(value) => `${Math.abs(value)}%`}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="age"
              width={72}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${Math.abs(value)}%`,
                `${name} 이탈률`,
              ]}
              labelFormatter={(label) => `연령대 ${label}`}
            />
            <Bar
              dataKey="maleRate"
              name="남성"
              fill={COLORS.male}
              stackId="pyramid"
              radius={[4, 0, 0, 4]}
            >
              <LabelList
                dataKey="maleRate"
                position="left"
                formatter={(value) => `${Math.abs(value)}%`}
              />
            </Bar>
            <Bar
              dataKey="femaleRate"
              name="여성"
              fill={COLORS.female}
              stackId="pyramid"
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey="femaleRate"
                position="right"
                formatter={(value) => `${value}%`}
              />
            </Bar>
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart message="연령대·성별 데이터가 없습니다." />
      )}
    </ChartCard>
  )
}

function ChildrenDonutChart({ data }) {
  return (
    <ChartCard
      title="자녀 유무별 이탈률"
      description="자녀 있음·없음 그룹의 이탈과 비이탈 비율을 각각 비교합니다."
      height="auto"
    >
      {data.length ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {data.map((item) => {
            const donutData = [
              { name: '이탈', value: item.churn, color: COLORS.churn },
              { name: '비이탈', value: item.retained, color: COLORS.retained },
            ]
            return (
              <div
                key={item.group}
                role="img"
                aria-label={`${item.group} 이탈률 ${item.churnRate}%, 전체 ${item.total}명 중 이탈 ${item.churn}명`}
                className="rounded-xl bg-slate-50 px-4 py-4"
              >
                <p className="text-center text-sm font-semibold text-slate-800">
                  {item.group}
                </p>
                <div className="relative h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={92}
                        paddingAngle={3}
                      >
                        {donutData.map((segment) => (
                          <Cell key={segment.name} fill={segment.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value}명`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7"
                    aria-hidden="true"
                  >
                    <p className="text-2xl font-bold text-rose-600">
                      {item.churnRate}%
                    </p>
                    <p className="text-xs text-slate-400">이탈률</p>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-400">
                  전체 {item.total}명 · 이탈 {item.churn}명
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyChart message="자녀 유무 데이터가 없습니다." />
      )}
    </ChartCard>
  )
}

function IncomeStackedChart({ data }) {
  return (
    <ChartCard
      title="소득 구간별 이탈률"
      description="각 소득 구간을 이탈과 비이탈의 100% 스택 막대로 비교합니다."
      height={Math.max(280, data.length * 54)}
    >
      {data.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 12, right: 32, left: 38, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[0, 100]}
              unit="%"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="group"
              width={115}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload
                return item ? `${label} · 전체 ${item.total}명` : label
              }}
            />
            <Legend />
            <Bar
              dataKey="churnRate"
              name="이탈"
              stackId="income"
              fill={COLORS.churn}
            >
              <LabelList
                dataKey="churnRate"
                position="center"
                formatter={(value) => `${value}%`}
                fill="#ffffff"
              />
            </Bar>
            <Bar
              dataKey="retainedRate"
              name="비이탈"
              stackId="income"
              fill={COLORS.retained}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart message="소득 구간 데이터가 없습니다." />
      )}
    </ChartCard>
  )
}

function EducationBookChart({ data }) {
  const totalCount = data.reduce((sum, item) => sum + item.total, 0)
  const totalChurn = data.reduce((sum, item) => sum + item.churn, 0)
  const averageChurnRate = totalCount
    ? Number(((totalChurn / totalCount) * 100).toFixed(1))
    : 0

  return (
    <ChartCard
      title="학력별 이탈률"
      description="세로 막대의 높이로 학력별 이탈률을 비교합니다."
      height={340}
    >
      {data.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 24, right: 24, left: 8, bottom: 24 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              type="category"
              dataKey="group"
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="number"
              domain={[0, 100]}
              unit="%"
              tick={{ fontSize: 11 }}
            />
            <ReferenceLine
              y={averageChurnRate}
              stroke="#7c3aed"
              strokeWidth={2}
              strokeDasharray="6 4"
              label={{
                value: `평균 ${averageChurnRate}%`,
                position: 'insideTopRight',
                fill: '#7c3aed',
                fontSize: 12,
              }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, '이탈률']}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload
                return item
                  ? `${label} · 전체 ${item.total}명 · 이탈 ${item.churn}명`
                  : label
              }}
            />
            <Bar
              dataKey="churnRate"
              name="이탈률"
              fill={COLORS.churn}
              radius={[4, 4, 0, 0]}
            >
              <LabelList
                dataKey="churnRate"
                position="top"
                formatter={(value) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart message="학력 데이터가 없습니다." />
      )}
    </ChartCard>
  )
}

function EmploymentHorizontalBarChart({ data }) {
  return (
    <ChartCard
      title="고용 상태별 이탈률"
      description="이탈률이 높은 고용 상태부터 위에서 아래로 정렬했습니다."
      height={Math.max(320, data.length * 52)}
    >
      {data.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 12, right: 54, left: 34, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[0, 100]}
              unit="%"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="group"
              width={110}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, '이탈률']}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload
                return item
                  ? `${label} · 전체 ${item.total}명 · 이탈 ${item.churn}명`
                  : label
              }}
            />
            <Bar
              dataKey="churnRate"
              name="이탈률"
              fill={COLORS.churn}
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey="churnRate"
                position="right"
                formatter={(value) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart message="고용 상태 데이터가 없습니다." />
      )}
    </ChartCard>
  )
}

function MaritalPieChart({ data }) {
  return (
    <ChartCard
      title="혼인 상태별 이탈률"
      description="파이 조각의 크기로 혼인 상태별 이탈률을 비교합니다."
      height={360}
    >
      {data.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="churnRate"
              nameKey="group"
              cx="50%"
              cy="46%"
              outerRadius={110}
              paddingAngle={3}
              labelLine
              label={({ name, value }) => `${name} ${value}%`}
            >
              {data.map((item, index) => (
                <Cell
                  key={item.group}
                  fill={MARITAL_COLORS[index % MARITAL_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, entry) => {
                const item = entry?.payload
                return [
                  item
                    ? `${value}% (이탈 ${item.churn}/${item.total}명)`
                    : `${value}%`,
                  '이탈률',
                ]
              }}
            />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChart message="혼인 상태 데이터가 없습니다." />
      )}
    </ChartCard>
  )
}

function ReligionIconPlot({ data }) {
  return (
    <ChartCard
      title="종교별 이탈률"
      description="상징 아이콘이 클수록 해당 종교 그룹의 이탈률이 높습니다."
      height="auto"
    >
      {data.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => {
            const normalizedGroup = item.group.startsWith('기타')
              ? '기타'
              : item.group
            const symbol = RELIGION_ICONS[normalizedGroup] || '◇'
            const iconSize = 34 + item.churnRate * 0.48
            return (
              <div
                key={item.group}
                role="img"
                aria-label={`${item.group} 이탈률 ${item.churnRate}%, 전체 ${item.total}명 중 이탈 ${item.churn}명`}
                className="flex min-h-44 flex-col items-center justify-center rounded-lg bg-slate-50 px-4 py-5 text-center"
              >
                <span
                  aria-hidden="true"
                  className="flex h-24 items-center justify-center text-rose-600"
                  style={{ fontSize: `${iconSize}px`, lineHeight: 1 }}
                >
                  {symbol}
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {item.group}
                </p>
                <p className="mt-1 text-lg font-bold text-rose-600">
                  {item.churnRate}%
                </p>
                <p className="text-xs text-slate-400">
                  {item.churn}/{item.total}명
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyChart message="종교 데이터가 없습니다." />
      )}
    </ChartCard>
  )
}

function ChartCard({ title, description, children, height = 280 }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
      <div className="mt-3" style={{ height }}>{children}</div>
    </article>
  )
}

function EmptyChart({ message }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
      {message}
    </div>
  )
}

function Stat({ label, value, accent = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ? 'text-rose-600' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  )
}
