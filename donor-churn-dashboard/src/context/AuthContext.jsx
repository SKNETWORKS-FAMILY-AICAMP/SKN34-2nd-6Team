/**
 * AuthContext — 클라이언트 mock 인증 (추후 API 교체)
 */
// [refactor: [MLP-4] 코드 삭제] import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// [refactor: [MLP-4] 코드 삭제] const STORAGE_KEY = 'doeep_auth'

import { createContext, useContext, useEffect, useState } from 'react' //[feat: [MLP-4] 기능 추가]
import {                              //[feat: [MLP-4] 기능 추가]
  createUserWithEmailAndPassword,     //[feat: [MLP-4] 기능 추가]
  onAuthStateChanged,                 //[feat: [MLP-4] 기능 추가]
  signInWithEmailAndPassword,         //[feat: [MLP-4] 기능 추가]
  signInWithPopup,                    //[feat: [MLP-4] 기능 추가]
  signOut,                            //[feat: [MLP-4] 기능 추가]
  updateProfile,                      //[feat: [MLP-4] 기능 추가]
} from 'firebase/auth'                //[feat: [MLP-4] 기능 추가]
import { auth, googleProvider } from '../services/firebase'     //[feat: [MLP-4] 기능 추가]
import { kakaoLogin, kakaoLogout } from '../utils/kakao'        //[feat: [MLP-4] 기능 추가]
import { ensureUserProfile } from '../services/userDb'          //[feat: [MLP-4] 기능 추가]
import { ensureKakaoProfile } from '../services/kakaoDb'        //[feat: [MLP-4] 기능 추가]

const AuthContext = createContext(null)                         //[feat: [MLP-4] 기능 추가]

const KAKAO_STORAGE_KEY = 'kakaoUser'                           //[feat: [MLP-4] 기능 추가]



const AuthContext = createContext(null)

// [refactor: [MLP-4] 코드 삭제] function readStoredAuth() {
// [refactor: [MLP-4] 코드 삭제] try {
// [refactor: [MLP-4] 코드 삭제]    return localStorage.getItem(STORAGE_KEY) === 'true'
// [refactor: [MLP-4] 코드 삭제]  } catch {
// [refactor: [MLP-4] 코드 삭제]    return false
// [refactor: [MLP-4] 코드 삭제]  }
// [refactor: [MLP-4] 코드 삭제]}

// [refactor: [MLP-4] 코드 삭제] export function AuthProvider({ children }) {
// [refactor: [MLP-4] 코드 삭제]  const [isAuthenticated, setIsAuthenticated] = useState(readStoredAuth)

// [refactor: [MLP-4] 코드 삭제]  const login = useCallback(() => {
// [refactor: [MLP-4] 코드 삭제]    localStorage.setItem(STORAGE_KEY, 'true')
// [refactor: [MLP-4] 코드 삭제]    setIsAuthenticated(true)
// [refactor: [MLP-4] 코드 삭제]  }, [])

// [refactor: [MLP-4] 코드 삭제]  const logout = useCallback(() => {
// [refactor: [MLP-4] 코드 삭제]    localStorage.removeItem(STORAGE_KEY)
// [refactor: [MLP-4] 코드 삭제]    setIsAuthenticated(false)
// [refactor: [MLP-4] 코드 삭제]  }, [])

// [refactor: [MLP-4] 코드 삭제]  const value = useMemo(
// [refactor: [MLP-4] 코드 삭제]    () => ({ isAuthenticated, login, logout }),
// [refactor: [MLP-4] 코드 삭제]    [isAuthenticated, login, logout],
// [refactor: [MLP-4] 코드 삭제]  )

// [refactor: [MLP-4] 코드 삭제]  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
// [refactor: [MLP-4] 코드 삭제]}

export function AuthProvider({ children }) {                  //[feat: [MLP-4] 기능 추가]
  const [firebaseUser, setFirebaseUser] = useState(null)      //[feat: [MLP-4] 기능 추가]
  const [kakaoUser, setKakaoUser] = useState(() => {          //[feat: [MLP-4] 기능 추가]
    const saved = localStorage.getItem(KAKAO_STORAGE_KEY)     //[feat: [MLP-4] 기능 추가]
    return saved ? JSON.parse(saved) : null                   //[feat: [MLP-4] 기능 추가]
  })                                                          //[feat: [MLP-4] 기능 추가]
  const [loading, setLoading] = useState(true)                //[feat: [MLP-4] 기능 추가]

  useEffect(() => {                                                     //[feat: [MLP-4] 기능 추가]
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {    //[feat: [MLP-4] 기능 추가]
      setFirebaseUser(fbUser)                                           //[feat: [MLP-4] 기능 추가]
      setLoading(false)                                                 //[feat: [MLP-4] 기능 추가]
      if (fbUser) {                                                                               //[feat: [MLP-4] 기능 추가]
        await ensureUserProfile(fbUser.uid, { name: fbUser.displayName, email: fbUser.email })    //[feat: [MLP-4] 기능 추가]
      }                                                                                           //[feat: [MLP-4] 기능 추가]
    })                                                                                            //[feat: [MLP-4] 기능 추가]
    return unsubscribe                                                                            //[feat: [MLP-4] 기능 추가]
  }, [])                                                                                          //[feat: [MLP-4] 기능 추가]

  const signup = async ({ name, email, password }) => {                                           //[feat: [MLP-4] 기능 추가]
    const credential = await createUserWithEmailAndPassword(auth, email, password)                //[feat: [MLP-4] 기능 추가]
    if (name) {                                                                                   //[feat: [MLP-4] 기능 추가]
      await updateProfile(credential.user, { displayName: name })                                 //[feat: [MLP-4] 기능 추가]
    }                                                                                             //[feat: [MLP-4] 기능 추가]
    return credential.user                                                                        //[feat: [MLP-4] 기능 추가]
  }                                                                                               //[feat: [MLP-4] 기능 추가]

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)            //[feat: [MLP-4] 기능 추가]

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider)       //[feat: [MLP-4] 기능 추가]

  const loginWithKakao = async () => {  //[feat: [MLP-4] 기능 추가]
    const profile = await kakaoLogin()  //[feat: [MLP-4] 기능 추가]
    await ensureKakaoProfile(profile.id, { nickname: profile.nickname, email: profile.email })  //[feat: [MLP-4] 기능 추가]
    localStorage.setItem(KAKAO_STORAGE_KEY, JSON.stringify(profile))  //[feat: [MLP-4] 기능 추가]
    setKakaoUser(profile) //[feat: [MLP-4] 기능 추가]
    return profile  //[feat: [MLP-4] 기능 추가]
  }

  const logout = async () => {                         //[feat: [MLP-4] 기능 추가]
    if (firebaseUser) await signOut(auth)              //[feat: [MLP-4] 기능 추가]
    if (kakaoUser) {                                  //[feat: [MLP-4] 기능 추가]
      await kakaoLogout()                             //[feat: [MLP-4] 기능 추가]
      localStorage.removeItem(KAKAO_STORAGE_KEY)      //[feat: [MLP-4] 기능 추가]
      setKakaoUser(null)                              //[feat: [MLP-4] 기능 추가]
    }                                         //[feat: [MLP-4] 기능 추가]
  }                                           //[feat: [MLP-4] 기능 추가]

  const user = firebaseUser                     //[feat: [MLP-4] 기능 추가]
    ? { provider: 'firebase', uid: firebaseUser.uid, name: firebaseUser.displayName, email: firebaseUser.email }    //[feat: [MLP-4] 기능 추가]
    : kakaoUser                                                                                       //[feat: [MLP-4] 기능 추가]
    ? { provider: 'kakao', uid: kakaoUser.id, name: kakaoUser.nickname, email: kakaoUser.email }      //[feat: [MLP-4] 기능 추가]
    : null                                                                                            //[feat: [MLP-4] 기능 추가]

  const value = {                       //[feat: [MLP-4] 기능 추가]
    user,                               //[feat: [MLP-4] 기능 추가]
    isAuthenticated: Boolean(user),     //[feat: [MLP-4] 기능 추가]
    loading,                            //[feat: [MLP-4] 기능 추가]
    signup,                             //[feat: [MLP-4] 기능 추가]
    login,                              //[feat: [MLP-4] 기능 추가]
    loginWithGoogle,                    //[feat: [MLP-4] 기능 추가]
    loginWithKakao,                     //[feat: [MLP-4] 기능 추가]
    logout,                             //[feat: [MLP-4] 기능 추가]
  }                                     //[feat: [MLP-4] 기능 추가]

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>    //[feat: [MLP-4] 기능 추가]
}                                                                                 //[feat: [MLP-4] 기능 추가]




export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
