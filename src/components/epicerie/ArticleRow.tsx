import { Check, Trash2 } from 'lucide-react'
import type { Article } from '../../types'

interface Props {
  article: Article
  onCoche: (estCoche: boolean) => void
  onSupprimer: () => void
}

export default function ArticleRow({ article, onCoche, onSupprimer }: Props) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 ${article.estCoche ? 'opacity-50' : ''}`}>
      <button
        onClick={() => onCoche(!article.estCoche)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          article.estCoche ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}
      >
        {article.estCoche && <Check size={13} color="white" />}
      </button>
      <span className={`flex-1 text-sm ${article.estCoche ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {article.quantite && (
          <span className="font-medium text-gray-600">{article.quantite} {article.unite} </span>
        )}
        {article.nom}
      </span>
      <button onClick={onSupprimer} className="p-1 text-red-400 opacity-60">
        <Trash2 size={16} />
      </button>
    </div>
  )
}
