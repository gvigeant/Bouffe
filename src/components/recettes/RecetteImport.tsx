import { useState, useRef } from 'react'
import { X, Camera, Link, FileText, PenLine, Loader2, AlertCircle } from 'lucide-react'
import type { RecetteExtraite } from '../../types'
import { extraireDepuisTexte, extraireDepuisHTML, extraireDepuisPhoto } from '../../services/recetteExtractor'

interface Props {
  apiKey: string
  onExtracted: (recette: RecetteExtraite) => void
  onManual: () => void
  onCancel: () => void
}

type Mode = 'choix' | 'photo' | 'texte' | 'url'

export default function RecetteImport({ apiKey, onExtracted, onManual, onCancel }: Props) {
  const [mode, setMode] = useState<Mode>('choix')
  const [texte, setTexte] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoData, setPhotoData] = useState<{ base64: string; mime: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      const base64 = result.split(',')[1]
      setPhotoData({ base64, mime: file.type })
      setPhotoPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const extraire = async () => {
    if (!apiKey) {
      setErreur("Clé Claude API manquante — configurez-la dans les Paramètres.")
      return
    }
    setLoading(true)
    setErreur('')
    try {
      let recette: RecetteExtraite
      if (mode === 'photo' && photoData) {
        recette = await extraireDepuisPhoto(apiKey, photoData.base64, photoData.mime)
      } else if (mode === 'texte') {
        recette = await extraireDepuisTexte(apiKey, texte)
      } else if (mode === 'url') {
        const proxyUrl = `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net/fetchUrl`
        const res = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        if (!res.ok) throw new Error('Impossible de charger la page. Vérifiez que la Firebase Function est déployée.')
        const { html } = await res.json()
        recette = await extraireDepuisHTML(apiKey, html)
      } else return
      onExtracted(recette)
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      <div className="bg-white flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={mode === 'choix' ? onCancel : () => { setMode('choix'); setErreur('') }} className="p-1">
          <X size={22} className="text-gray-500" />
        </button>
        <h2 className="font-bold text-lg">Ajouter une recette</h2>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'choix' && (
          <div className="space-y-3 pt-4">
            <p className="text-sm text-gray-500 text-center mb-6">Comment voulez-vous ajouter la recette?</p>

            <button
              onClick={() => { setMode('photo'); fileRef.current?.click() }}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:bg-gray-50"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Camera size={24} className="text-orange-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Photo</p>
                <p className="text-xs text-gray-400">Prendre une photo ou choisir depuis la galerie</p>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
            />

            <button
              onClick={() => setMode('url')}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:bg-gray-50"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Link size={24} className="text-blue-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Importer depuis une URL</p>
                <p className="text-xs text-gray-400">Ricardo, Cuisine Futée, et plus</p>
              </div>
            </button>

            <button
              onClick={() => setMode('texte')}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:bg-gray-50"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Coller du texte</p>
                <p className="text-xs text-gray-400">Depuis Notes, email, ou autre</p>
              </div>
            </button>

            <button
              onClick={onManual}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:bg-gray-50"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <PenLine size={24} className="text-gray-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Saisie manuelle</p>
                <p className="text-xs text-gray-400">Remplir les champs vous-même</p>
              </div>
            </button>
          </div>
        )}

        {mode === 'photo' && (
          <div className="space-y-4 pt-4">
            <div
              className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center"
              onClick={() => fileRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                  <Camera size={48} />
                  <p className="text-sm mt-2">Toucher pour sélectionner</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
            />
            {erreur && (
              <div className="flex gap-2 items-start bg-red-50 rounded-xl p-3 text-red-600 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {erreur}
              </div>
            )}
            {photoPreview && (
              <button
                onClick={extraire}
                disabled={loading}
                className="w-full bg-orange-500 text-white rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Analyse en cours...</> : 'Extraire la recette'}
              </button>
            )}
          </div>
        )}

        {mode === 'texte' && (
          <div className="space-y-4 pt-4">
            <textarea
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="Collez votre recette ici..."
              rows={12}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-orange-400"
            />
            {erreur && (
              <div className="flex gap-2 items-start bg-red-50 rounded-xl p-3 text-red-600 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {erreur}
              </div>
            )}
            <button
              onClick={extraire}
              disabled={loading || !texte.trim()}
              className="w-full bg-orange-500 text-white rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Analyse en cours...</> : 'Extraire la recette'}
            </button>
          </div>
        )}

        {mode === 'url' && (
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">URL de la recette</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.ricardocuisine.com/..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
              <strong>Note :</strong> Cette fonctionnalité nécessite une Firebase Function déployée (plan Blaze requis).
            </div>
            {erreur && (
              <div className="flex gap-2 items-start bg-red-50 rounded-xl p-3 text-red-600 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {erreur}
              </div>
            )}
            <button
              onClick={extraire}
              disabled={loading || !url.trim()}
              className="w-full bg-orange-500 text-white rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Chargement...</> : 'Importer la recette'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
