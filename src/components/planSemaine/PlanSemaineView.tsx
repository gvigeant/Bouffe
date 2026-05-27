import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, X, ListPlus } from 'lucide-react'
import ChoisirSouper from './ChoisirSouper'
import type { Souper, Recette, Liste } from '../../types'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function formaterDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${JOURS[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()}`
}

function formatLundi(lundiISO: string): string {
  const d = new Date(lundiISO + 'T00:00:00')
  const fin = new Date(d)
  fin.setDate(d.getDate() + 6)
  return `${d.getDate()} au ${fin.getDate()} ${fin.toLocaleDateString('fr-CA', { month: 'long' })}`
}

interface Props {
  jours: string[]
  soupers: Souper[]
  lundi: string
  recettes: Recette[]
  listes: Liste[]
  onSemainePrecedente: () => void
  onSemaineSuivante: () => void
  onAssigner: (date: string, recetteId: string | null, titre: string, nomLibre: string) => Promise<void>
  onVider: (date: string) => Promise<void>
  onGenererListe: (listeId: string, jours: string[], soupers: Souper[], recettes: Recette[]) => Promise<void>
}

export default function PlanSemaineView({
  jours, soupers, lundi, recettes, listes,
  onSemainePrecedente, onSemaineSuivante,
  onAssigner, onVider, onGenererListe,
}: Props) {
  const navigate = useNavigate()
  const [jourChoisi, setJourChoisi] = useState<string | null>(null)
  const [showGenerer, setShowGenerer] = useState(false)

  const soupersMap = Object.fromEntries(soupers.map((s) => [s.date, s]))

  const handleGenerer = async (listeId: string) => {
    setShowGenerer(false)
    await onGenererListe(listeId, jours, soupers, recettes)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Plan de soupers</h1>
        <div className="flex items-center justify-between">
          <button onClick={onSemainePrecedente} className="p-2 rounded-full bg-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {formatLundi(lundi)}
          </span>
          <button onClick={onSemaineSuivante} className="p-2 rounded-full bg-gray-100">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Jours */}
      <div className="flex-1 overflow-y-auto pb-32 p-4 space-y-2">
        {jours.map((jour) => {
          const souper = soupersMap[jour]
          return (
            <div
              key={jour}
              className="bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-3"
            >
              <div className="w-12 text-center flex-shrink-0">
                <p className="text-xs text-gray-400 font-medium">{formaterDate(jour).split(' ')[0]}</p>
                <p className="text-lg font-bold text-gray-900">{formaterDate(jour).split(' ')[1]}</p>
              </div>
              <div className="flex-1 min-w-0">
                {souper ? (
                  <button
                    onClick={() => souper.recetteId && navigate(`/recettes/${souper.recetteId}`)}
                    className="text-left w-full"
                  >
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {souper.recetteTitre || souper.nomLibre}
                    </p>
                    {souper.recetteId && (
                      <p className="text-xs text-orange-500">Voir la recette →</p>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setJourChoisi(jour)}
                    className="flex items-center gap-1 text-gray-300 text-sm"
                  >
                    <Plus size={16} /> Ajouter un souper
                  </button>
                )}
              </div>
              {souper ? (
                <button onClick={() => onVider(jour)} className="p-1 text-gray-300">
                  <X size={18} />
                </button>
              ) : (
                <button onClick={() => setJourChoisi(jour)} className="p-1 text-orange-400">
                  <Plus size={20} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Bouton générer liste */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-gradient-to-t from-gray-50 to-transparent">
        <button
          onClick={() => setShowGenerer(true)}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white rounded-2xl py-3.5 font-semibold shadow-lg"
        >
          <ListPlus size={20} /> Générer la liste d'épicerie
        </button>
      </div>

      {/* Modal choisir souper */}
      {jourChoisi && (
        <ChoisirSouper
          date={jourChoisi}
          recettes={recettes}
          onChoisir={async (recetteId, titre, nomLibre) => {
            await onAssigner(jourChoisi, recetteId, titre, nomLibre)
            setJourChoisi(null)
          }}
          onAnnuler={() => setJourChoisi(null)}
        />
      )}

      {/* Modal choisir liste pour génération */}
      {showGenerer && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setShowGenerer(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Ajouter à quelle liste?</h3>
            {listes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Aucune liste d'épicerie. Créez-en une d'abord.</p>
            ) : (
              listes.map((liste) => (
                <button
                  key={liste.id}
                  onClick={() => handleGenerer(liste.id)}
                  className="w-full text-left py-3 border-b border-gray-100 last:border-0"
                >
                  <p className="font-medium text-gray-900">{liste.nom}</p>
                  <p className="text-xs text-gray-400">{liste.epicerieNom}</p>
                </button>
              ))
            )}
            <button onClick={() => setShowGenerer(false)} className="w-full mt-4 py-3 text-gray-500 font-medium">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
