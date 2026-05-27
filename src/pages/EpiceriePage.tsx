import { useNavigate } from 'react-router-dom'
import EpiceriesView from '../components/epicerie/EpiceriesView'
import { useEpiceries, useListes } from '../hooks/useEpicerie'

export default function EpiceriePage() {
  const navigate = useNavigate()
  const { epiceries, ajouterEpicerie } = useEpiceries()
  const { listes, creerListe, supprimerListe } = useListes()

  return (
    <EpiceriesView
      epiceries={epiceries}
      listes={listes}
      onCreerListe={async (epicerieId, epicerieNom, nom) => {
        const id = await creerListe(epicerieId, epicerieNom, nom)
        navigate(`/epicerie/${id}`)
        return id
      }}
      onAjouterEpicerie={ajouterEpicerie}
      onSupprimerListe={supprimerListe}
    />
  )
}
