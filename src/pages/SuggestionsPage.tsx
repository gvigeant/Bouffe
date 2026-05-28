import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import SpeciauxView from '../components/suggestions/SpeciauxView'
import SuggestionResults from '../components/suggestions/SuggestionResults'
import { useSpeciaux } from '../hooks/useSpeciaux'
import { useRecettes } from '../hooks/useRecettes'
import { usePlanSemaine } from '../hooks/usePlanSemaine'
import { useSettings } from '../hooks/useSettings'
import { suggererRecettes } from '../services/claudeAPI'

interface Suggestion {
  titre: string
  description: string
  speciaux: string[]
  magasin: string | null
  estRecetteConnue: boolean
  ideeIngredients: string[]
}

export default function SuggestionsPage() {
  const { speciaux, lundiActuel, ajouterSpecial, supprimerSpecial } = useSpeciaux()
  const { recettes } = useRecettes()
  const { soupers, assignerSouper } = usePlanSemaine()
  const { settings } = useSettings()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [jourChoisi, setJourChoisi] = useState('')

  const planActuel = soupers.map((s) => s.recetteTitre || s.nomLibre).filter(Boolean)

  const getSuggestions = async () => {
    if (!settings.claudeApiKey) {
      setErreur("Clé Claude API manquante. Configurez-la dans les Paramètres.")
      return
    }
    setLoading(true)
    setErreur('')
    setSuggestions([])
    try {
      const raw = await suggererRecettes(settings.claudeApiKey, speciaux, recettes, planActuel)
      const parsed = JSON.parse(raw)
      setSuggestions(parsed.suggestions ?? [])
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const ajouterAuPlan = async (titre: string) => {
    if (!jourChoisi) {
      setJourChoisi(titre)
      return
    }
    await assignerSouper(jourChoisi, null, '', titre)
    setJourChoisi('')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 pt-safe pb-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={22} className="text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Suggestions</h1>
        </div>
        <p className="text-xs text-gray-400">Semaine du {lundiActuel}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-5">
        <SpeciauxView
          speciaux={speciaux}
          semaine={lundiActuel}
          onAjouter={ajouterSpecial}
          onSupprimer={supprimerSpecial}
        />

        {/* Bouton suggestions */}
        <button
          onClick={getSuggestions}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white rounded-2xl py-4 font-semibold shadow-sm disabled:opacity-50 active:bg-orange-600"
        >
          <Sparkles size={20} />
          {loading ? 'Claude réfléchit...' : 'Suggère-moi des recettes'}
        </button>

        <SuggestionResults
          suggestions={suggestions}
          loading={loading}
          erreur={erreur}
          onAjouterAuPlan={ajouterAuPlan}
        />
      </div>
    </div>
  )
}
