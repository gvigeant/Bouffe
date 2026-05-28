import { useParams } from 'react-router-dom'
import ListeDetail from '../components/epicerie/ListeDetail'
import { useListes } from '../hooks/useEpicerie'

export default function ListeDetailPage() {
  const { listeId } = useParams<{ listeId: string }>()
  const { listes, ajouterArticle, cocherArticle, supprimerArticle, supprimerListe } = useListes()

  const liste = listes.find((l) => l.id === listeId)

  if (!liste) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300">
        <span className="text-4xl mb-2">🛒</span>
        <p className="text-sm">Liste introuvable</p>
      </div>
    )
  }

  return (
    <ListeDetail
      liste={liste}
      onAjouterArticle={(art) => ajouterArticle(liste.id, liste.articles, art)}
      onCocherArticle={(artId, val) => cocherArticle(liste.id, liste.articles, artId, val)}
      onSupprimerArticle={(artId) => supprimerArticle(liste.id, liste.articles, artId)}
      onSupprimerListe={() => supprimerListe(liste.id)}
    />
  )
}
