import { useEffect, useState, useCallback } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { AppSettings } from '../types'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({ claudeApiKey: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'app'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as AppSettings)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const sauvegarderCleAPI = useCallback(async (claudeApiKey: string) => {
    await setDoc(doc(db, 'settings', 'app'), { claudeApiKey })
  }, [])

  return { settings, loading, sauvegarderCleAPI }
}
