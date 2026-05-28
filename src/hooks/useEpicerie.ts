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
import type { Epicerie, Liste, Article } from '../types'

const EPICERIES_PREDEFINIES: Omit<Epicerie, 'id'>[] = [
  { nom: 'IGA', estPredéfinie: true, ordre: 0 },
  { nom: 'Maxi', estPredéfinie: true, ordre: 1 },
  { nom: 'Costco', estPredéfinie: true, ordre: 2 },
  { nom: 'Metro', estPredéfinie: true, ordre: 3 },
]

export function useEpiceries() {
  const [epiceries, setEpiceries] = useState<Epicerie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'epiceries'), orderBy('ordre'))
    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        for (const e of EPICERIES_PREDEFINIES) {
          await addDoc(collection(db, 'epiceries'), e)
        }
      } else {
        setEpiceries(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Epicerie)))
        setLoading(false)
      }
    })
    return unsub
  }, [])

  const ajouterEpicerie = useCallback(async (nom: string) => {
    await addDoc(collection(db, 'epiceries'), {
      nom,
      estPredéfinie: false,
      ordre: epiceries.length,
    })
  }, [epiceries.length])

  const supprimerEpicerie = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'epiceries', id))
  }, [])

  return { epiceries, loading, ajouterEpicerie, supprimerEpicerie }
}

export function useListes() {
  const [listes, setListes] = useState<Liste[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'listes'), orderBy('dateCreation', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setListes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Liste)))
      setLoading(false)
    })
    return unsub
  }, [])

  const creerListe = useCallback(async (epicerieId: string, epicerieNom: string, nom: string) => {
    const ref = await addDoc(collection(db, 'listes'), {
      epicerieId,
      epicerieNom,
      nom,
      dateCreation: serverTimestamp(),
      articles: [],
    })
    return ref.id
  }, [])

  const supprimerListe = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'listes', id))
  }, [])

  const mettreAJourArticles = useCallback(async (listeId: string, articles: Article[]) => {
    await updateDoc(doc(db, 'listes', listeId), { articles })
  }, [])

  const ajouterArticle = useCallback(async (listeId: string, articles: Article[], article: Omit<Article, 'id' | 'ordre'>) => {
    const nouvelArticle: Article = {
      ...article,
      id: crypto.randomUUID(),
      ordre: articles.length,
      estCoche: false,
    }
    await updateDoc(doc(db, 'listes', listeId), {
      articles: [...articles, nouvelArticle],
    })
  }, [])

  const cocherArticle = useCallback(async (listeId: string, articles: Article[], articleId: string, estCoche: boolean) => {
    const updated = articles.map((a) => a.id === articleId ? { ...a, estCoche } : a)
    await updateDoc(doc(db, 'listes', listeId), { articles: updated })
  }, [])

  const supprimerArticle = useCallback(async (listeId: string, articles: Article[], articleId: string) => {
    await updateDoc(doc(db, 'listes', listeId), {
      articles: articles.filter((a) => a.id !== articleId),
    })
  }, [])

  return {
    listes,
    loading,
    creerListe,
    supprimerListe,
    mettreAJourArticles,
    ajouterArticle,
    cocherArticle,
    supprimerArticle,
  }
}
