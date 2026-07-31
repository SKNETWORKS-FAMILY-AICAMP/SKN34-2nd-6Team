/**
 * donorRosterDb — Firebase 로그인 사용자 기부자 명단
 * (이메일/전화/이름 기준으로 중복 시 최신 예측으로 갱신)
 *
 * 경로: donorRosters/{uid}/donors/{donorId}
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

function requireDb() {
  if (!db) {
    throw new Error('Firebase가 설정되지 않았습니다. 루트 .env의 VITE_FIREBASE_* 를 확인하세요.')
  }
}

function requireFirebaseUser(user) {
  if (!user?.uid) throw new Error('로그인이 필요합니다.')
  if (user.provider === 'kakao') {
    throw new Error('기부자 명단 저장은 이메일(Google) 로그인 계정만 지원합니다.')
  }
  return String(user.uid)
}

function sanitizeId(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[/#[\]]/g, '_')
    .slice(0, 140)
}

/** 이메일 > 전화 > 이름 순으로 동일 인물 키 */
export function donorDocId(donor) {
  const email = String(donor.email || '')
    .trim()
    .toLowerCase()
  if (email && email !== '—' && email.includes('@')) {
    return sanitizeId(`e_${email}`)
  }
  const phone = String(donor.phone || '').replace(/\D/g, '')
  if (phone.length >= 8) {
    return sanitizeId(`p_${phone}`)
  }
  const name = String(donor.name || '').trim()
  if (name && name !== '—') {
    return sanitizeId(`n_${name}`)
  }
  return sanitizeId(`r_${donor.row_index ?? Date.now()}`)
}

function donorsCol(ownerId) {
  return collection(db, 'donorRosters', ownerId, 'donors')
}

/**
 * 배치 예측 결과를 명단에 upsert
 * @returns {{ saved: number, updated: number }}
 */
export async function upsertDonorsFromBatch(user, results = []) {
  requireDb()
  const ownerId = requireFirebaseUser(user)
  if (!Array.isArray(results) || results.length === 0) {
    return { saved: 0, updated: 0 }
  }

  const existing = await listDonors(user)
  const existingIds = new Set(existing.map((d) => d.id))

  let saved = 0
  let updated = 0
  const chunkSize = 400
  const rows = [...results]

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const batch = writeBatch(db)
    for (const r of chunk) {
      const id = donorDocId(r)
      const ref = doc(donorsCol(ownerId), id)
      const isUpdate = existingIds.has(id)
      if (isUpdate) updated += 1
      else {
        saved += 1
        existingIds.add(id)
      }
      batch.set(
        ref,
        {
          ownerId,
          name: r.name || '',
          email: r.email || '',
          phone: r.phone || '',
          probability: r.probability ?? null,
          probability_pct: r.probability_pct ?? null,
          risk_level: r.risk_level || '',
          recommended_channel: r.recommended_channel || '',
          next_step: r.next_step || '',
          profile: r.profile || null,
          updatedAt: serverTimestamp(),
          ...(isUpdate ? {} : { createdAt: serverTimestamp() }),
        },
        { merge: true },
      )
    }
    await batch.commit()
  }

  return { saved, updated }
}

export async function listDonors(user) {
  requireDb()
  const ownerId = requireFirebaseUser(user)
  try {
    const q = query(donorsCol(ownerId), orderBy('updatedAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    const snapshot = await getDocs(donorsCol(ownerId))
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    rows.sort((a, b) => {
      const ta = a.updatedAt?.toMillis?.() ?? 0
      const tb = b.updatedAt?.toMillis?.() ?? 0
      return tb - ta
    })
    return rows
  }
}

export async function deleteDonor(user, donorId) {
  requireDb()
  const ownerId = requireFirebaseUser(user)
  await deleteDoc(doc(donorsCol(ownerId), donorId))
}

/** 쉬어가기·조치 로그 등 부분 갱신 */
export async function updateDonorFields(user, donorId, fields) {
  requireDb()
  const ownerId = requireFirebaseUser(user)
  await updateDoc(doc(donorsCol(ownerId), donorId), {
    ...fields,
    updatedAt: serverTimestamp(),
  })
}
