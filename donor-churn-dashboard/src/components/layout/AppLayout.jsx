/**
 * AppLayout — 브랜드 + 기능 네비 + 인증 헤더
 * 홈에서는 다크 글래스 헤더, 그 외 페이지는 라이트 헤더 유지
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

  const headerShell = isHome
    ? 'sticky top-0 z-40 border-b border-white/10 bg-[#0B1220]/75 text-slate-100 backdrop-blur-xl'
    : 'sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur'

  const brandText = isHome ? 'text-white' : 'text-slate-900'
  const mutedText = isHome ? 'text-slate-400' : 'text-slate-400'
  const navIdle = isHome
    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  const navActive = isHome
    ? 'bg-white/10 font-medium text-teal-200'
    : 'bg-teal-50 font-medium text-teal-800'
  const ghostBtn = isHome
    ? 'text-slate-300 hover:bg-white/10 hover:text-white'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  const mobilePanel = isHome
    ? 'border-white/10 bg-[#0B1220] text-slate-100'
    : 'border-slate-100 bg-white'
  const mobileIdle = isHome ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-50'
  const mobileActive = isHome
    ? 'bg-white/10 font-medium text-teal-200'
    : 'bg-teal-50 font-medium text-teal-800'
  const menuBorder = isHome ? 'border-white/20 text-slate-200' : 'border-slate-200 text-slate-600'

  return (
    <div className={`min-h-screen ${isHome ? 'bg-[#0B1220]' : 'bg-slate-50'}`}>
      <header className={headerShell}>
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className={`flex shrink-0 items-center gap-2 ${brandText}`}>
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-teal-600 text-white shadow-[3px_3px_7px_rgba(15,23,42,0.25)] sm:h-12 sm:w-12">
              <img src="/logo_white.png" alt="doeep 로고" className="h-full w-full object-contain" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm font-bold tracking-tight">doeep</span>
              <span className={`text-[10px] ${mutedText}`}>Let&apos;s doeep</span>
            </span>
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-6 md:flex lg:gap-10"
            aria-label="기능 바로가기"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm transition lg:px-4 ${
                    isActive ? navActive : navIdle
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 text-sm sm:gap-2">
            {isAuthenticated ? (
              <>
                <span className={`hidden max-w-[8rem] truncate sm:inline ${isHome ? 'text-slate-200' : 'text-slate-700'}`}>
                  {displayName(user)}
                </span>
                {MY_PAGE_LINK ? (
                  <NavLink
                    to={MY_PAGE_LINK.path}
                    className={({ isActive }) =>
                      `hidden rounded-lg px-3 py-1.5 transition sm:inline-block ${
                        isActive ? navActive : ghostBtn
                      }`
                    }
                  >
                    {MY_PAGE_LINK.name}
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  onClick={logout}
                  className={`hidden rounded-lg px-3 py-1.5 transition sm:inline-block ${ghostBtn}`}
                >
                  로그아웃
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `hidden rounded-lg px-3 py-1.5 transition sm:inline-block ${
                    isActive ? navActive : ghostBtn
                  }`
                }
              >
                로그인
              </NavLink>
            )}
            {!isAuthenticated ? (
              <NavLink
                to="/signup"
                className="rounded-full bg-teal-500 px-3.5 py-1.5 font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                회원가입
              </NavLink>
            ) : null}
            <button
              type="button"
              className={`rounded-lg border p-2 md:hidden ${menuBorder}`}
              aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className={`border-t px-4 py-3 md:hidden ${mobilePanel}`}>
            <nav className="flex flex-col gap-1" aria-label="모바일 기능 바로가기">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm ${isActive ? mobileActive : mobileIdle}`
                  }
                >
                  <span className="font-medium">{item.name}</span>
                  <span className={`mt-0.5 block text-xs ${mutedText}`}>{item.teaser}</span>
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  <p className="px-3 py-2 text-sm font-medium">{displayName(user)}</p>
                  {MY_PAGE_LINK ? (
                    <NavLink
                      to={MY_PAGE_LINK.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2 text-sm ${isActive ? mobileActive : mobileIdle}`
                      }
                    >
                      <span className="font-medium">{MY_PAGE_LINK.name}</span>
                      <span className={`mt-0.5 block text-xs ${mutedText}`}>
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
                    className={`rounded-lg px-3 py-2 text-left text-sm ${mobileIdle}`}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm ${mobileIdle}`}
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
