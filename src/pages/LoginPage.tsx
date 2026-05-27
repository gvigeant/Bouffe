import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const connexion = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErreur('')
    try {
      await signInWithEmailAndPassword(auth, email, motDePasse)
    } catch {
      setErreur('Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 bg-gray-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🍽</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bouffe</h1>
          <p className="text-gray-400 text-sm mt-1">Recettes, épicerie & plan de soupers</p>
        </div>

        <form onSubmit={connexion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoComplete="email"
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
            />
          </div>

          {erreur && (
            <p className="text-red-500 text-sm text-center">{erreur}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white rounded-2xl py-3.5 font-semibold text-base mt-2 disabled:opacity-50 active:bg-orange-600 transition-colors shadow-md"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-8">
          Utilisez le compte partagé que vous avez créé dans Firebase.
        </p>
      </div>
    </div>
  )
}
