/**
 * AppLayout — 브랜드 + 기능 네비 + 인증 헤더
 */
import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { MY_PAGE_LINK, NAV_LINKS } from '../../data/featureLinks'
import { useAuth } from '../../context/AuthContext'

function displayName(user) {
  const name = user?.name?.trim()
  if (name) return `${name}님`
  if (user?.email) return `${user.email.split('@')[0]}님`
  return '회원님'
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const isHome = pathname === '/'
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="relative mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Link to="/" className="z-10 flex shrink-0 items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] sm:h-12 sm:w-12">
              <img
                src="/doeep-mark.png"
                alt="doeep"
                className="h-8 w-8 object-contain sm:h-9 sm:w-9"
              />
            </span>
            <span className="font-brand text-lg font-semibold tracking-tight text-[#076625] sm:text-xl">
              doeep
            </span>
          </Link>

          {/* Desktop feature nav — 헤더 정중앙 */}
          <nav
            className="absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex lg:gap-10"
            aria-label="기능 바로가기"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm transition lg:px-4 ${
                    isActive
                      ? 'bg-teal-50 font-medium text-teal-800'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="z-10 ml-auto flex items-center gap-1.5 text-sm sm:gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden max-w-[8rem] truncate text-slate-700 sm:inline">
                  {displayName(user)}
                </span>
                {MY_PAGE_LINK ? (
                  <NavLink
                    to={MY_PAGE_LINK.path}
                    className={({ isActive }) =>
                      `hidden rounded-lg px-3 py-1.5 transition sm:inline-block ${
                        isActive
                          ? 'bg-teal-50 font-medium text-teal-800'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    {MY_PAGE_LINK.name}
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  onClick={logout}
                  className="hidden rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-block"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `hidden rounded-lg px-3 py-1.5 transition sm:inline-block ${
                    isActive
                      ? 'bg-slate-100 font-medium text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                로그인
              </NavLink>
            )}
            {!isAuthenticated ? (
              <NavLink
                to="/signup"
                className="rounded-lg bg-teal-600 px-3 py-1.5 font-medium text-white transition hover:bg-teal-700"
              >
                회원가입
              </NavLink>
            ) : null}
            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
              aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="모바일 기능 바로가기">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm ${
                      isActive
                        ? 'bg-teal-50 font-medium text-teal-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">{item.teaser}</span>
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  <p className="px-3 py-2 text-sm font-medium text-slate-800">
                    {displayName(user)}
                  </p>
                  {MY_PAGE_LINK ? (
                    <NavLink
                      to={MY_PAGE_LINK.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2 text-sm ${
                          isActive
                            ? 'bg-teal-50 font-medium text-teal-800'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`
                      }
                    >
                      <span className="font-medium">{MY_PAGE_LINK.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {MY_PAGE_LINK.teaser}
                      </span>
                    </NavLink>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                    }}
                    className="rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  로그인
                </NavLink>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      <main className={isHome ? 'w-full' : 'mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10'}>
        <Outlet />
      </main>
    </div>
  )
}
