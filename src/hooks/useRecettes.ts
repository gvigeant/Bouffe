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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
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

  const ajouterRecette = useCallback(async (draft: RecetteDraft, photoFile?: File) => {
    let photoURL = draft.photoURL
    if (photoFile) {
      const storageRef = ref(storage, `recettes/${Date.now()}_${photoFile.name}`)
      const snap = await uploadBytes(storageRef, photoFile)
      photoURL = await getDownloadURL(snap.ref)
    }
    await addDoc(collection(db, 'recettes'), {
      ...draft,
      photoURL,
      dateAjout: serverTimestamp(),
    })
  }, [])

  const modifierRecette = useCallback(async (id: string, draft: Partial<RecetteDraft>, photoFile?: File) => {
    let updates: Partial<RecetteDraft> & { photoURL?: string } = { ...draft }
    if (photoFile) {
      const storageRef = ref(storage, `recettes/${Date.now()}_${photoFile.name}`)
      const snap = await uploadBytes(storageRef, photoFile)
      updates.photoURL = await getDownloadURL(snap.ref)
    }
    await updateDoc(doc(db, 'recettes', id), updates)
  }, [])

  const supprimerRecette = useCallback(async (id: string, photoURL?: string) => {
    await deleteDoc(doc(db, 'recettes', id))
    if (photoURL) {
      try {
        await deleteObject(ref(storage, photoURL))
      } catch { /* ignore si déjà supprimé */ }
    }
  }, [])

  return { recettes, loading, ajouterRecette, modifierRecette, supprimerRecette }
}
