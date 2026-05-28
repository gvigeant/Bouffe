import { useState } from 'react'
import RecettesList from '../components/recettes/RecettesList'
import RecetteImport from '../components/recettes/RecetteImport'
import RecetteForm from '../components/recettes/RecetteForm'
import { useRecettes } from '../hooks/useRecettes'
import { useSettings } from '../hooks/useSettings'
import type { RecetteExtraite } from '../types'

type Vue = 'liste' | 'import' | 'form'

export default function RecettesPage() {
  const { recettes, loading, ajouterRecette } = useRecettes()
  const { settings } = useSettings()
  const [vue, setVue] = useState<Vue>('liste')
  const [extrait, setExtrait] = useState<RecetteExtraite | null>(null)

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-300 text-sm">Chargement...</div>
  }

  if (vue === 'import') {
    return (
      <RecetteImport
        apiKey={settings.claudeApiKey}
        onExtracted={(recette) => {
          setExtrait(recette)
          setVue('form')
        }}
        onManual={() => {
          setExtrait(null)
          setVue('form')
        }}
        onCancel={() => setVue('liste')}
      />
    )
  }

  if (vue === 'form') {
    return (
      <RecetteForm
        initial={extrait ?? undefined}
        titre={extrait ? 'Vérifier la recette' : 'Nouvelle recette'}
        onSave={async (draft) => {
          await ajouterRecette(draft)
          setVue('liste')
          setExtrait(null)
        }}
        onCancel={() => {
          setExtrait(null)
          setVue(extrait ? 'import' : 'liste')
        }}
      />
    )
  }

  return (
    <RecettesList
      recettes={recettes}
      onAjouter={() => setVue('import')}
    />
  )
}
