import { CalendarPlus, Loader2 } from 'lucide-react'

interface Suggestion {
  titre: string
  description: string
  speciaux: string[]
  magasin: string | null
  estRecetteConnue: boolean
  ideeIngredients: string[]
}

interface Props {
  suggestions: Suggestion[]
  loading: boolean
  erreur: string
  onAjouterAuPlan: (titre: string) => void
}

export default function SuggestionResults({ suggestions, loading, erreur, onAjouterAuPlan }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <Loader2 size={32} className="animate-spin text-orange-400" />
        <p className="text-sm">Claude cuisine des idées...</p>
      </div>
    )
  }

  if (erreur) {
    return (
      <div className="bg-red-50 rounded-2xl p-4 text-red-600 text-sm">
        <p className="font-medium mb-1">Erreur</p>
        <p>{erreur}</p>
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <div className="space-y-3">
      {suggestions.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{s.titre}</p>
              {s.estRecetteConnue && (
                <span className="text-xs text-orange-500 font-medium">Dans vos recettes</span>
              )}
            </div>
            <button
              onClick={() => onAjouterAuPlan(s.titre)}
              className="flex-shrink-0 flex items-center gap-1 bg-orange-100 text-orange-600 text-xs font-medium px-2.5 py-1.5 rounded-full"
            >
              <CalendarPlus size={13} /> Plan
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-2">{s.description}</p>
          {s.speciaux.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {s.speciaux.map((sp) => (
                <span key={sp} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  🏷 {sp}{s.magasin ? ` (${s.magasin})` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
