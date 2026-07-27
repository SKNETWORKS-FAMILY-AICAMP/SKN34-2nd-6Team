/**
 * requireLogin — 비로그인 인터랙션 시 안내 후 로그인 이동
 */
export function requireLogin(navigate, from = '/') {
  alert('해당 기능을 사용하려면 로그인을 해야합니다')
  navigate('/login', { state: { from } })
}
