/**
 * activityDb — 팀 공용 활동 기록(마이페이지용) Firestore 서비스
 *
 * 대상 경로: donor-churn-dashboard\src\services\activityDb.js (새 파일)
 */
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from './firebase'

export async function logActivity(uid, { type, summary, meta = null }) {
  await addDoc(collection(db, 'activities'), {
    uid,
    type,
    summary,
    meta,
    createdAt: serverTimestamp(),
  })
}

export async function getUserActivities(uid) {
  const q = query(collection(db, 'activities'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
