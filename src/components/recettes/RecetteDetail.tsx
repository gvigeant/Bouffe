import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Users, ChefHat, Edit, Trash2, ShoppingCart, Check } from 'lucide-react'
import type { Recette, Liste } from '../../types'

interface Props {
  recette: Recette
  listes: Liste[]
  onModifier: () => void
  onSupprimer: () => void
  onAjouterAListe: (listeId: string, ingredients: Recette['ingredients']) => void
}

const CATEGORIE_EMOJI: Record<string, string> = {
  Viande: '🥩', Poisson: '🐟', Végé: '🥦', Pâtes: '🍝',
  Soupe: '🍲', Dessert: '🍰', Autre: '🍽',
}

export default function RecetteDetail({ recette, listes, onModifier, onSupprimer, onAjouterAListe }: Props) {
  const navigate = useNavigate()
  const [onglet, setOnglet] = useState<'ingredients' | 'preparation'>('ingredients')
  const [coches, setCoches] = useState<Set<string>>(new Set())
  const [showListeModal, setShowListeModal] = useState(false)
  const [showSupprimerModal, setShowSupprimerModal] = useState(false)

  const toggleCoche = (id: string) => {
    setCoches((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const tempsTotal = recette.tempsPrepMinutes + recette.tempsCuissonMinutes

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Photo header */}
      <div className="relative">
        <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
          {recette.photoURL ? (
            <img src={recette.photoURL} alt={recette.titre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl bg-orange-50">
              {CATEGORIE_EMOJI[recette.categorie] ?? '🍽'}
            </div>
          )}
        </div>
        {/* Overlay boutons */}
        <div className="absolute top-0 left-0 right-0 flex justify-between p-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={onModifier}
              className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Edit size={18} color="white" />
            </button>
            <button
              onClick={() => setShowSupprimerModal(true)}
              className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Trash2 size={18} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-gray-900">{recette.titre}</h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
              {CATEGORIE_EMOJI[recette.categorie]} {recette.categorie}
            </span>
            {recette.tempsPrepMinutes > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                <Clock size={11} /> Prép. {recette.tempsPrepMinutes} min
              </span>
            )}
            {recette.tempsCuissonMinutes > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                <ChefHat size={11} /> Cuisson {recette.tempsCuissonMinutes} min
              </span>
            )}
            {tempsTotal > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                <Clock size={11} /> Total {tempsTotal} min
              </span>
            )}
            {recette.nbPortions > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                <Users size={11} /> {recette.nbPortions} portions
              </span>
            )}
          </div>

          {recette.notePersonnelle && (
            <p className="mt-3 text-sm text-gray-500 italic bg-amber-50 rounded-xl p-3 border border-amber-100">
              "{recette.notePersonnelle}"
            </p>
          )}
        </div>

        {/* Onglets */}
        <div className="bg-white mt-2 px-4">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setOnglet('ingredients')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                onglet === 'ingredients'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-400'
              }`}
            >
              Ingrédients ({recette.ingredients.length})
            </button>
            <button
              onClick={() => setOnglet('preparation')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                onglet === 'preparation'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-400'
              }`}
            >
              Préparation
            </button>
          </div>

          {onglet === 'ingredients' && (
            <div className="py-3 pb-6">
              {recette.ingredients.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">Aucun ingrédient</p>
              ) : (
                recette.ingredients.map((ing) => (
                  <button
                    key={ing.id}
                    onClick={() => toggleCoche(ing.id)}
                    className="w-full flex items-center gap-3 py-2.5 border-b border-gray-50 text-left"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      coches.has(ing.id) ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                    }`}>
                      {coches.has(ing.id) && <Check size={12} color="white" />}
                    </div>
                    <span className={`text-sm transition-colors ${coches.has(ing.id) ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
                      {ing.quantite && <span className="font-medium">{ing.quantite} {ing.unite} </span>}
                      {ing.nom}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          {onglet === 'preparation' && (
            <div className="py-3 pb-6">
              {recette.instructions.length === 0 ? (
                <p className="text-gray-400 text-sm py-4 text-center">Aucune instruction</p>
              ) : (
                recette.instructions.map((etape, i) => (
                  <div key={i} className="flex gap-3 mb-4">
                    <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed flex-1">{etape}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bouton ajouter à liste */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 pb-24">
        <button
          onClick={() => setShowListeModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white rounded-2xl py-3 font-semibold active:bg-orange-600 transition-colors"
        >
          <ShoppingCart size={18} />
          Ajouter à une liste d'épicerie
        </button>
      </div>

      {/* Modal liste */}
      {showListeModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowListeModal(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Choisir une liste</h3>
            {listes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Aucune liste d'épicerie. Créez-en une dans l'onglet Épicerie.</p>
            ) : (
              listes.map((liste) => (
                <button
                  key={liste.id}
                  onClick={() => {
                    onAjouterAListe(liste.id, recette.ingredients)
                    setShowListeModal(false)
                  }}
                  className="w-full text-left py-3 border-b border-gray-100 last:border-0"
                >
                  <p className="font-medium text-gray-900">{liste.nom}</p>
                  <p className="text-xs text-gray-400">{liste.epicerieNom}</p>
                </button>
              ))
            )}
            <button onClick={() => setShowListeModal(false)} className="w-full mt-4 py-3 text-gray-500 font-medium">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showSupprimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-center mb-2">Supprimer la recette?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSupprimerModal(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold">
                Annuler
              </button>
              <button
                onClick={() => { setShowSupprimerModal(false); onSupprimer() }}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
