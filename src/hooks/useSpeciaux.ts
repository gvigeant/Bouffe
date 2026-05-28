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
import type { Special } from '../types'

function getLundiDeSemaine(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export function useSpeciaux(semaine?: string) {
  const lundiActuel = semaine ?? getLundiDeSemaine(new Date())
  const [speciaux, setSpeciaux] = useState<Special[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'speciaux'), where('semaine', '==', lundiActuel))
    const unsub = onSnapshot(q, (snap) => {
      setSpeciaux(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Special)))
      setLoading(false)
    })
    return unsub
  }, [lundiActuel])

  const ajouterSpecial = useCallback(async (
    produit: string,
    epicerieNom: string,
    prixOriginal: number | null,
    prixSolde: number | null,
    notes: string
  ) => {
    await addDoc(collection(db, 'speciaux'), {
      produit,
      epicerieNom,
      prixOriginal,
      prixSolde,
      notes,
      semaine: lundiActuel,
    })
  }, [lundiActuel])

  const modifierSpecial = useCallback(async (id: string, updates: Partial<Special>) => {
    await updateDoc(doc(db, 'speciaux', id), updates)
  }, [])

  const supprimerSpecial = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'speciaux', id))
  }, [])

  return { speciaux, loading, lundiActuel, ajouterSpecial, modifierSpecial, supprimerSpecial }
}
