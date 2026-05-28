import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Recette } from '../types'

type RecetteDraft = Omit<Recette, 'id' | 'dateAjout'>

export function useRecettes() {
  const [recettes, setRecettes] = useState<Recette[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'recettes'), orderBy('dateAjout', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setRecettes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Recette)))
      setLoading(false)
    })
    return unsub
  }, [])

  const ajouterRecette = useCallback(async (draft: RecetteDraft) => {
    await addDoc(collection(db, 'recettes'), {
      ...draft,
      photoURL: '',
      dateAjout: serverTimestamp(),
    })
  }, [])

  const modifierRecette = useCallback(async (id: string, draft: Partial<RecetteDraft>) => {
    await updateDoc(doc(db, 'recettes', id), draft)
  }, [])

  const supprimerRecette = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'recettes', id))
  }, [])

  return { recettes, loading, ajouterRecette, modifierRecette, supprimerRecette }
}
