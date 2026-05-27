import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Clock, Users } from 'lucide-react'
import type { Recette, CategorieRecette } from '../../types'

const CATEGORIES: { value: CategorieRecette | 'Tout'; label: string }[] = [
  { value: 'Tout', label: 'Tout' },
  { value: 'Viande', label: '🥩 Viande' },
  { value: 'Poisson', label: '🐟 Poisson' },
  { value: 'Végé', label: '🥦 Végé' },
  { value: 'Pâtes', label: '🍝 Pâtes' },
  { value: 'Soupe', label: '🍲 Soupe' },
  { value: 'Dessert', label: '🍰 Dessert' },
  { value: 'Autre', label: '🍽 Autre' },
]

interface Props {
  recettes: Recette[]
  onAjouter: () => void
}

export default function RecettesList({ recettes, onAjouter }: Props) {
  const navigate = useNavigate()
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState<CategorieRecette | 'Tout'>('Tout')

  const filtrées = useMemo(() => {
    return recettes.filter((r) => {
      const matchCat = categorie === 'Tout' || r.categorie === categorie
      const matchSearch = r.titre.toLowerCase().includes(recherche.toLowerCase())
      return matchCat && matchSearch
    })
  }, [recettes, recherche, categorie])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Recettes</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        {/* Filtres */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategorie(cat.value as CategorieRecette | 'Tout')}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categorie === cat.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {filtrées.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <span className="text-4xl mb-2">🍽</span>
            <p className="text-sm">Aucune recette trouvée</p>
            <button
              onClick={onAjouter}
              className="mt-4 text-orange-500 text-sm font-medium"
            >
              Ajouter une recette
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtrées.map((recette) => (
              <button
                key={recette.id}
                onClick={() => navigate(`/recettes/${recette.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm text-left active:scale-95 transition-transform"
              >
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  {recette.photoURL ? (
                    <img
                      src={recette.photoURL}
                      alt={recette.titre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🍽
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">
                    {recette.titre}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    {(recette.tempsPrepMinutes + recette.tempsCuissonMinutes) > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} />
                        {recette.tempsPrepMinutes + recette.tempsCuissonMinutes} min
                      </span>
                    )}
                    {recette.nbPortions > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Users size={10} />
                        {recette.nbPortions}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onAjouter}
        className="fixed right-4 bottom-20 z-40 w-14 h-14 bg-orange-500 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus size={28} color="white" strokeWidth={2.5} />
      </button>
    </div>
  )
}
