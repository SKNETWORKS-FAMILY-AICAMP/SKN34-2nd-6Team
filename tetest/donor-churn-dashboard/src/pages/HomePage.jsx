/**
 * HomePage — 기부 이탈 예측·예방 랜딩
 */
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { FEATURE_LINKS } from '../data/featureLinks'
import BatchScoringPanel from '../components/daeho/BatchScoringPanel'
import { useAuth } from '../context/AuthContext'
import { requireLogin } from '../utils/requireLogin'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleRequireLogin = () => requireLogin(navigate, '/')

  return (
    <div>
      {/* Hero — 왼쪽 카피(불투명) + 오른쪽 비주얼 */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-slate-50">
        <div className="relative grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {/* 텍스트 컬럼: 불투명 배경 + z-index로 이미지와 겹침 방지 */}
          <div className="home-fade-in relative z-20 flex flex-col justify-center bg-slate-50 px-4 py-14 sm:px-6 sm:py-20 lg:py-24 lg:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] lg:pr-12">
            <div className="w-full max-w-xl">
              <p className="text-sm font-semibold tracking-[0.14em] text-teal-700 uppercase">
                DOEEP · 두잎
              </p>
              <p className="mt-1 text-xs tracking-wide text-slate-400">Let's doeep</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                기부 이탈을 예측하고,
                <br className="hidden sm:block" /> 기부 문화 참여를 이어갑니다
              </h1>

              <div className="mt-7 max-w-lg space-y-4 text-base leading-relaxed break-keep text-slate-600 sm:text-[1.05rem]">
                <p>
                  기부 활동은 감소 추세에 있었고, 이는 복지 정책의 사각지대에 있는
                  사람들을 도울 수 있는 가능성이 줄어들고 있음을 시사합니다. 최근에는
                  반등해 다시금 증가하는 추세를 보이고 있습니다.
                </p>
                <p>
                  이 추세가 이어지도록, 우리는 기부 이탈자를 예측해 이탈을 막고 기부
                  활동이 줄어드는 것을 예방하는 것을 목적으로 둡니다.
                </p>
                <p>
                  더 나아가 기부 중단 사유, 기부 이유, 기부 분야를 탐색해 이탈자나
                  기부 경험이 없는&nbsp;사람도 기부 문화에 참여할 수 있도록
                  유도하고자 합니다.
                </p>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  기능 살펴보기
                  <ArrowDown className="h-4 w-4" />
                </a>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </div>

          {/* 이미지: 텍스트 영역 밖으로만, 왼쪽은 강하게 페이드 */}
          <div className="relative z-10 min-h-[260px] sm:min-h-[340px] lg:min-h-full">
            <img
              src="/hero-connection.png"
              alt="따뜻한 손길과 연결된 기부 커뮤니티를 상징하는 이미지"
              className="home-hero-image h-full w-full object-cover object-[70%_center]"
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent"
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* Batch scoring preview */}
      <section id="preview" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              기부자 관리 미리보기
            </h2>
            <p className="text-sm text-slate-500 sm:text-base">
              {isAuthenticated
                ? '전체 기능은 대호 페이지에서 사용할 수 있습니다.'
                : '로그인 후 전체 기능을 사용할 수 있습니다.'}
            </p>
          </div>
          <BatchScoringPanel
            mode="preview"
            isAuthenticated={isAuthenticated}
            onRequireLogin={handleRequireLogin}
          />
          {isAuthenticated ? (
            <div className="mt-6">
              <Link
                to="/daeho"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
              >
                전체 기능으로 이동
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/* Feature entry */}
      <section id="features" className="scroll-mt-20 bg-white py-16 sm:py-20">
        <div className="home-fade-in-delay mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              우리가 하는 일
            </h2>
            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              문제 인식에서 예측·예방, 사유·동기·분야 탐색, 참여 유도까지 —
              각 영역으로 이동해 기능을 이어 붙입니다. (표시명은 추후 실제
              기능명으로 교체 예정)
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_LINKS.map((item, index) => (
              <li
                key={item.id}
                className={index === FEATURE_LINKS.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''}
              >
                <Link
                  to={item.path}
                  className="group flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-5 transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50/40 hover:shadow-sm"
                >
                  <div>
                    <p className="text-xs font-medium tracking-wide text-teal-700">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.teaser}</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-teal-700 transition group-hover:gap-2">
                    이동
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <p className="max-w-xl text-sm text-slate-600 sm:text-base">
            기부 이탈을 줄이고, 기부 문화 참여를 이어 가는 여정에 함께해 주세요.
          </p>
          <Link
            to="/signup"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
