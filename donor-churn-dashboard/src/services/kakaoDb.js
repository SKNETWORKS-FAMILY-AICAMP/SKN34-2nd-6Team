import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

const kakaoUsersCollection = (uid) => doc(db, 'kakaoUsers', uid)

export async function ensureKakaoProfile(uid, { nickname, email }) {
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
  const snapshot = await getDoc(kakaoUsersCollection(uid))
  return snapshot.exists() ? snapshot.data() : null
}

export async function updateKakaoProfile(uid, data) {
  await updateDoc(kakaoUsersCollection(uid), { ...data, uid, updatedAt: serverTimestamp() })
}

export async function deleteKakaoProfile(uid) {
  await deleteDoc(kakaoUsersCollection(uid))
}
