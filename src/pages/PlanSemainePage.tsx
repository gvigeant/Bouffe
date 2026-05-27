import { useState } from 'react'
import PlanSemaineView from '../components/planSemaine/PlanSemaineView'
import { usePlanSemaine } from '../hooks/usePlanSemaine'
import { useRecettes } from '../hooks/useRecettes'
import { useListes, useEpiceries } from '../hooks/useEpicerie'
import type { Souper, Recette } from '../types'

function getLundiDeSemaine(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function deplacerSemaine(lundiISO: string, direction: 1 | -1): string {
  const d = new Date(lundiISO + 'T00:00:00')
  d.setDate(d.getDate() + direction * 7)
  return d.toISOString().split('T')[0]
}

export default function PlanSemainePage() {
  const [lundi, setLundi] = useState(() => getLundiDeSemaine(new Date()))
  const { soupers, jours, assignerSouper, viderJour } = usePlanSemaine(lundi)
  const { recettes } = useRecettes()
  const { listes, mettreAJourArticles } = useListes()
  useEpiceries()

  const genererListe = async (listeId: string, _jours: string[], soupers: Souper[], recettes: Recette[]) => {
    const liste = listes.find((l) => l.id === listeId)
    if (!liste) return

    const recetteIds = soupers
      .filter((s) => s.recetteId)
      .map((s) => s.recetteId as string)

    const recettesSelectionnées = recettes.filter((r) => recetteIds.includes(r.id))
    const nouveaux = recettesSelectionnées.flatMap((r) =>
      r.ingredients.map((ing, i) => ({
        id: crypto.randomUUID(),
        nom: ing.nom,
        quantite: ing.quantite,
        unite: ing.unite,
        estCoche: false,
        ordre: liste.articles.length + i,
        recetteSourceId: r.id,
      }))
    )

    await mettreAJourArticles(listeId, [...liste.articles, ...nouveaux])
  }

  return (
    <PlanSemaineView
      jours={jours}
      soupers={soupers}
      lundi={lundi}
      recettes={recettes}
      listes={listes}
      onSemainePrecedente={() => setLundi(deplacerSemaine(lundi, -1))}
      onSemaineSuivante={() => setLundi(deplacerSemaine(lundi, 1))}
      onAssigner={assignerSouper}
      onVider={viderJour}
      onGenererListe={genererListe}
    />
  )
}
