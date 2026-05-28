import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Souper } from '../types'

function getLundiDeSemaine(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export function getJoursDeSemaine(lundiISO: string): string[] {
  const lundi = new Date(lundiISO + 'T00:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lundi)
    d.setDate(lundi.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export function usePlanSemaine(semaine?: string) {
  const lundiActuel = semaine ?? getLundiDeSemaine(new Date())
  const jours = getJoursDeSemaine(lundiActuel)
  const [soupers, setSoupers] = useState<Souper[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'planSemaine'),
      where('date', '>=', jours[0]),
      where('date', '<=', jours[6])
    )
    const unsub = onSnapshot(q, (snap) => {
      setSoupers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Souper)))
      setLoading(false)
    })
    return unsub
  }, [lundiActuel])

  const assignerSouper = useCallback(async (
    date: string,
    recetteId: string | null,
    recetteTitre: string,
    nomLibre: string
  ) => {
    const existant = soupers.find((s) => s.date === date)
    if (existant) {
      await updateDoc(doc(db, 'planSemaine', existant.id), {
        recetteId,
        recetteTitre,
        nomLibre,
      })
    } else {
      await addDoc(collection(db, 'planSemaine'), {
        date,
        recetteId,
        recetteTitre,
        nomLibre,
      })
    }
  }, [soupers])

  const viderJour = useCallback(async (date: string) => {
    const existant = soupers.find((s) => s.date === date)
    if (existant) {
      await deleteDoc(doc(db, 'planSemaine', existant.id))
    }
  }, [soupers])

  return { soupers, loading, jours, lundiActuel, assignerSouper, viderJour }
}
