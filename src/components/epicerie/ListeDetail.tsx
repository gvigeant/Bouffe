import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, CheckCheck } from 'lucide-react'
import ArticleRow from './ArticleRow'
import type { Liste, Article } from '../../types'

interface Props {
  liste: Liste
  onAjouterArticle: (article: Omit<Article, 'id' | 'ordre'>) => Promise<void>
  onCocherArticle: (articleId: string, estCoche: boolean) => Promise<void>
  onSupprimerArticle: (articleId: string) => Promise<void>
  onSupprimerListe: () => Promise<void>
}

export default function ListeDetail({ liste, onAjouterArticle, onCocherArticle, onSupprimerArticle, onSupprimerListe }: Props) {
  const navigate = useNavigate()
  const [showAjouter, setShowAjouter] = useState(false)
  const [nom, setNom] = useState('')
  const [quantite, setQuantite] = useState('')
  const [unite, setUnite] = useState('')
  const [showSupprimer, setShowSupprimer] = useState(false)

  const articlesCohes = liste.articles.filter((a) => a.estCoche)
  const articlesRestants = liste.articles.filter((a) => !a.estCoche)

  const ajouter = async () => {
    if (!nom.trim()) return
    await onAjouterArticle({ nom: nom.trim(), quantite, unite, estCoche: false })
    setNom('')
    setQuantite('')
    setUnite('')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{liste.nom}</h1>
            <p className="text-xs text-gray-400">{liste.epicerieNom}</p>
          </div>
          <button onClick={() => setShowSupprimer(true)} className="p-1 text-red-400">
            <Trash2 size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
          <span>{articlesRestants.length} article{articlesRestants.length !== 1 ? 's' : ''} restant{articlesRestants.length !== 1 ? 's' : ''}</span>
          {articlesCohes.length > 0 && (
            <span className="text-green-500 flex items-center gap-1">
              <CheckCheck size={13} /> {articlesCohes.length} complété{articlesCohes.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto pb-40">
        {liste.articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300">
            <span className="text-4xl mb-2">🛒</span>
            <p className="text-sm">Liste vide</p>
          </div>
        ) : (
          <div className="bg-white mt-2 mx-4 rounded-2xl shadow-sm overflow-hidden">
            {articlesRestants.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                onCoche={(v) => onCocherArticle(article.id, v)}
                onSupprimer={() => onSupprimerArticle(article.id)}
              />
            ))}
            {articlesCohes.length > 0 && articlesRestants.length > 0 && (
              <div className="px-4 py-2 bg-gray-50">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Complétés</p>
              </div>
            )}
            {articlesCohes.map((article) => (
              <ArticleRow
                key={article.id}
                article={article}
                onCoche={(v) => onCocherArticle(article.id, v)}
                onSupprimer={() => onSupprimerArticle(article.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ajouter article */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-6 safe-bottom">
        {showAjouter ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                placeholder="Qté"
                className="w-14 bg-gray-100 rounded-xl px-2 py-2 text-xs text-center outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="text"
                value={unite}
                onChange={(e) => setUnite(e.target.value)}
                placeholder="ml/g..."
                className="w-16 bg-gray-100 rounded-xl px-2 py-2 text-xs text-center outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Article..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && ajouter()}
                className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAjouter(false)} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-gray-600 text-sm font-medium">
                Annuler
              </button>
              <button onClick={ajouter} className="flex-1 py-2.5 bg-orange-500 rounded-xl text-white text-sm font-semibold">
                Ajouter
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAjouter(true)}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white rounded-2xl py-3 font-semibold"
          >
            <Plus size={18} /> Ajouter un article
          </button>
        )}
      </div>

      {/* Confirm supprimer liste */}
      {showSupprimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-center mb-2">Supprimer la liste?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">"{liste.nom}" sera définitivement supprimée.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSupprimer(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold">
                Annuler
              </button>
              <button
                onClick={async () => { await onSupprimerListe(); navigate(-1) }}
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
