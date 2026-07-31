/**
 * AuthContext — Firebase 이메일/구글 + 카카오 로그인
 */
import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'
import { kakaoLogin, kakaoLogout } from '../utils/kakao'
import { ensureUserProfile } from '../services/userDb'
import { ensureKakaoProfile } from '../services/kakaoDb'

const AuthContext = createContext(null)
const KAKAO_STORAGE_KEY = 'kakaoUser'

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [kakaoUser, setKakaoUser] = useState(() => {
    try {
      const saved = localStorage.getItem(KAKAO_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return undefined
    }
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      setLoading(false)
      if (fbUser) {
        await ensureUserProfile(fbUser.uid, {
          name: fbUser.displayName,
          email: fbUser.email,
        })
      }
    })
    return unsubscribe
  }, [])

  const signup = async ({ name, email, password }) => {
    if (!auth) throw new Error('Firebase가 설정되지 않았습니다. 루트 .env를 확인하세요.')
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    if (name) {
      await updateProfile(credential.user, { displayName: name })
    }
    return credential.user
  }

  const login = (email, password) => {
    if (!auth) throw new Error('Firebase가 설정되지 않았습니다. 루트 .env를 확인하세요.')
    return signInWithEmailAndPassword(auth, email, password)
  }

  const loginWithGoogle = () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase가 설정되지 않았습니다. 루트 .env를 확인하세요.')
    }
    return signInWithPopup(auth, googleProvider)
  }

  const loginWithKakao = async () => {
    const profile = await kakaoLogin()
    await ensureKakaoProfile(profile.id, {
      nickname: profile.nickname,
      email: profile.email,
    })
    localStorage.setItem(KAKAO_STORAGE_KEY, JSON.stringify(profile))
    setKakaoUser(profile)
    return profile
  }

  const logout = async () => {
    if (firebaseUser && auth) await signOut(auth)
    if (kakaoUser) {
      await kakaoLogout()
      localStorage.removeItem(KAKAO_STORAGE_KEY)
      setKakaoUser(null)
    }
  }

  const user = firebaseUser
    ? {
        provider: 'firebase',
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
      }
    : kakaoUser
      ? {
          provider: 'kakao',
          uid: kakaoUser.id,
          name: kakaoUser.nickname,
          email: kakaoUser.email,
        }
      : null

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithKakao,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
