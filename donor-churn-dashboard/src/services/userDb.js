import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

const usersCollection = (uid) => doc(db, 'users', uid)

export async function ensureUserProfile(uid, { name, email }) {
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
  const snapshot = await getDoc(usersCollection(uid))
  return snapshot.exists() ? snapshot.data() : null
}

export async function updateUserProfile(uid, data) {
  await updateDoc(usersCollection(uid), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteUserProfile(uid) {
  await deleteDoc(usersCollection(uid))
}
