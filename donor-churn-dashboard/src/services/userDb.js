import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

function requireDb() {
  if (!db) throw new Error('Firebase가 설정되지 않았습니다. 루트 .env의 VITE_FIREBASE_* 를 확인하세요.')
}

const usersCollection = (uid) => doc(db, 'users', uid)

export async function ensureUserProfile(uid, { name, email }) {
  requireDb()
  const ref = usersCollection(uid)
  const snapshot = await getDoc(ref)
  if (snapshot.exists()) return snapshot.data()

  const profile = {
    uid,
    name: name ?? '',
    email: email ?? '',
    bio: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, profile)
  return profile
}

export async function getUserProfile(uid) {
  requireDb()
  const snapshot = await getDoc(usersCollection(uid))
  return snapshot.exists() ? snapshot.data() : null
}

export async function updateUserProfile(uid, data) {
  requireDb()
  await updateDoc(usersCollection(uid), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteUserProfile(uid) {
  requireDb()
  await deleteDoc(usersCollection(uid))
}
