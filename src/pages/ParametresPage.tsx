import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { Settings, Key, LogOut, Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react'
import { auth } from '../firebase'
import { useSettings } from '../hooks/useSettings'
import { useAuth } from '../contexts/AuthContext'

export default function ParametresPage() {
  const { user } = useAuth()
  const { settings, sauvegarderCleAPI } = useSettings()
  const [cleAPI, setCleAPI] = useState(settings.claudeApiKey)
  const [showCle, setShowCle] = useState(false)
  const [saved, setSaved] = useState(false)

  const sauvegarder = async () => {
    await sauvegarderCleAPI(cleAPI)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Settings size={22} className="text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        {/* Compte */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Compte</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-sm">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{user?.email}</p>
              <p className="text-xs text-gray-400">Compte partagé</p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-50 rounded-xl py-2.5 text-sm font-medium"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
        </div>

        {/* Clé API Claude */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Intelligence artificielle
          </p>
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-orange-500" />
            <label className="text-sm font-medium text-gray-900">Clé API Claude</label>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Requise pour les suggestions de recettes et l'extraction automatique.{' '}
            <span className="text-orange-500">console.anthropic.com</span>
          </p>
          <div className="relative mb-3">
            <input
              type={showCle ? 'text' : 'password'}
              value={cleAPI}
              onChange={(e) => { setCleAPI(e.target.value); setSaved(false) }}
              placeholder="sk-ant-api03-..."
              className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm pr-10 outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={() => setShowCle(!showCle)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showCle ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            onClick={sauvegarder}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              saved ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
            }`}
          >
            {saved ? <><CheckCircle size={16} /> Sauvegardé!</> : 'Sauvegarder la clé'}
          </button>

          <div className="mt-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
            <strong>Note sécurité :</strong> La clé API est stockée dans Firebase et visible dans les requêtes réseau.
            Pour un usage personnel entre vous deux, c'est acceptable. Limitez les permissions de la clé sur la console Anthropic.
          </div>
        </div>

        {/* À propos */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">À propos</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Version</span>
              <span className="text-gray-400">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Hébergement</span>
              <span className="text-gray-400 flex items-center gap-1">GitHub Pages <ExternalLink size={12} /></span>
            </div>
            <div className="flex items-center justify-between">
              <span>Base de données</span>
              <span className="text-gray-400">Firebase</span>
            </div>
            <div className="flex items-center justify-between">
              <span>IA</span>
              <span className="text-gray-400">Claude (Anthropic)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
