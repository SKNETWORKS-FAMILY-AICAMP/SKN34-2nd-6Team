const SDK_URL = 'https://developers.kakao.com/sdk/js/kakao.js'

let loadPromise = null

function loadKakaoSdk() {
  if (window.Kakao) return Promise.resolve(window.Kakao)
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.onload = () => resolve(window.Kakao)
    script.onerror = () => reject(new Error('카카오 SDK를 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })

  return loadPromise
}

export async function getKakao() {
  const Kakao = await loadKakaoSdk()
  const jsKey = import.meta.env.VITE_KAKAO_JS_KEY
  if (!Kakao.isInitialized()) {
    Kakao.init(jsKey)
  }
  return Kakao
}

export async function kakaoLogin() {
  const Kakao = await getKakao()

  await new Promise((resolve, reject) => {
    Kakao.Auth.login({
      scope: 'profile_nickname',
      success: resolve,
      fail: reject,
    })
  })

  const profile = await new Promise((resolve, reject) => {
    Kakao.API.request({
      url: '/v2/user/me',
      success: resolve,
      fail: reject,
    })
  })

  return {
    id: String(profile.id),
    email: profile.kakao_account?.email ?? null,
    nickname: profile.kakao_account?.profile?.nickname ?? '카카오 사용자',
    profileImage: profile.kakao_account?.profile?.profile_image_url ?? null,
  }
}

export async function kakaoLogout() {
  const Kakao = await getKakao()
  if (!Kakao.Auth.getAccessToken()) return
  await new Promise((resolve) => {
    Kakao.Auth.logout(() => resolve())
  })
}
