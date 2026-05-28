import { useState } from 'react'
import { X, Search } from 'lucide-react'
import type { Recette } from '../../types'

interface Props {
  date: string
  recettes: Recette[]
  onChoisir: (recetteId: string | null, titre: string, nomLibre: string) => void
  onAnnuler: () => void
}

export default function ChoisirSouper({ recettes, onChoisir, onAnnuler }: Props) {
  const [onglet, setOnglet] = useState<'recettes' | 'libre'>('recettes')
  const [recherche, setRecherche] = useState('')
  const [nomLibre, setNomLibre] = useState('')

  const filtrées = recettes.filter((r) =>
    r.titre.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button onClick={onAnnuler}><X size={22} className="text-gray-500" /></button>
        <h2 className="font-bold text-lg">Choisir un souper</h2>
        <div className="w-8" />
      </div>

      {/* Onglets */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setOnglet('recettes')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 -mb-px ${
            onglet === 'recettes' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'
          }`}
        >
          Mes recettes
        </button>
        <button
          onClick={() => setOnglet('libre')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 -mb-px ${
            onglet === 'libre' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'
          }`}
        >
          Nom libre
        </button>
      </div>

      {onglet === 'recettes' ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtrées.map((r) => (
              <button
                key={r.id}
                onClick={() => onChoisir(r.id, r.titre, '')}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 text-left active:bg-gray-50"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {r.photoURL ? (
                    <img src={r.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">🍽</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.titre}</p>
                  <p className="text-xs text-gray-400">{r.categorie}</p>
                </div>
              </button>
            ))}
            {filtrées.length === 0 && (
              <div className="text-center py-10 text-gray-300">
                <p className="text-sm">Aucune recette trouvée</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 flex flex-col gap-4">
          <input
            type="text"
            value={nomLibre}
            onChange={(e) => setNomLibre(e.target.value)}
            placeholder="Ex: Sushis, Poutine, Sortie au resto..."
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && nomLibre.trim() && onChoisir(null, '', nomLibre.trim())}
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={() => nomLibre.trim() && onChoisir(null, '', nomLibre.trim())}
            disabled={!nomLibre.trim()}
            className="w-full py-3 bg-orange-500 text-white rounded-2xl font-semibold disabled:opacity-40"
          >
            Confirmer
          </button>
        </div>
      )}
    </div>
  )
}
