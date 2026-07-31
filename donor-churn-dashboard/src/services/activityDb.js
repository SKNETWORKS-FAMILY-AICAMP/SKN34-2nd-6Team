/**
 * activityDb — 팀 공용 활동 기록(마이페이지용) Firestore 서비스
 */
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from './firebase'

function requireDb() {
  if (!db) throw new Error('Firebase가 설정되지 않았습니다. 루트 .env의 VITE_FIREBASE_* 를 확인하세요.')
}

export async function logActivity(uid, { type, summary, meta = null }) {
  requireDb()
  await addDoc(collection(db, 'activities'), {
    uid,
    type,
    summary,
    meta,
    createdAt: serverTimestamp(),
  })
}

export async function getUserActivities(uid) {
  requireDb()
  const q = query(
    collection(db, 'activities'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
}
