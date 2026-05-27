import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import RecetteDetail from '../components/recettes/RecetteDetail'
import RecetteForm from '../components/recettes/RecetteForm'
import { useRecettes } from '../hooks/useRecettes'
import { useListes } from '../hooks/useEpicerie'
import type { Recette } from '../types'

export default function RecetteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { recettes, modifierRecette, supprimerRecette } = useRecettes()
  const { listes, mettreAJourArticles } = useListes()
  const [editMode, setEditMode] = useState(false)

  const recette = recettes.find((r) => r.id === id)

  if (!recette) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300">
        <span className="text-4xl mb-2">😕</span>
        <p className="text-sm">Recette introuvable</p>
      </div>
    )
  }

  if (editMode) {
    return (
      <RecetteForm
        initial={recette}
        titre="Modifier la recette"
        onSave={async (draft, photoFile) => {
          await modifierRecette(recette.id, draft, photoFile)
          setEditMode(false)
        }}
        onCancel={() => setEditMode(false)}
      />
    )
  }

  const handleAjouterAListe = async (listeId: string, ingredients: Recette['ingredients']) => {
    const liste = listes.find((l) => l.id === listeId)
    if (!liste) return
    const nouveaux = ingredients.map((ing, i) => ({
      id: crypto.randomUUID(),
      nom: ing.nom,
      quantite: ing.quantite,
      unite: ing.unite,
      estCoche: false,
      ordre: liste.articles.length + i,
      recetteSourceId: recette.id,
    }))
    await mettreAJourArticles(listeId, [...liste.articles, ...nouveaux])
  }

  return (
    <RecetteDetail
      recette={recette}
      listes={listes}
      onModifier={() => setEditMode(true)}
      onSupprimer={async () => {
        await supprimerRecette(recette.id, recette.photoURL)
        navigate(-1)
      }}
      onAjouterAListe={handleAjouterAListe}
    />
  )
}
