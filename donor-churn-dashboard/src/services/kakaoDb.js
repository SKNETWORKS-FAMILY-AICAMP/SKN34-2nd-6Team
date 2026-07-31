import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

function requireDb() {
  if (!db) throw new Error('Firebase가 설정되지 않았습니다. 루트 .env의 VITE_FIREBASE_* 를 확인하세요.')
}

const kakaoUsersCollection = (uid) => doc(db, 'kakaoUsers', uid)

export async function ensureKakaoProfile(uid, { nickname, email }) {
  requireDb()
  const ref = kakaoUsersCollection(uid)
  const snapshot = await getDoc(ref)
  if (snapshot.exists()) return snapshot.data()

  const profile = {
    uid,
    name: nickname ?? '',
    email: email ?? '',
    bio: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, profile)
  return profile
}

export async function getKakaoProfile(uid) {
  requireDb()
  const snapshot = await getDoc(kakaoUsersCollection(uid))
  return snapshot.exists() ? snapshot.data() : null
}

export async function updateKakaoProfile(uid, data) {
  requireDb()
  await updateDoc(kakaoUsersCollection(uid), { ...data, uid, updatedAt: serverTimestamp() })
}

export async function deleteKakaoProfile(uid) {
  requireDb()
  await deleteDoc(kakaoUsersCollection(uid))
}
