import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, ShoppingBag, X } from 'lucide-react'
import type { Epicerie, Liste } from '../../types'
import { useVisualViewport } from '../../hooks/useVisualViewport'

interface Props {
  epiceries: Epicerie[]
  listes: Liste[]
  onCreerListe: (epicerieId: string, epicerieNom: string, nom: string) => Promise<string>
  onAjouterEpicerie: (nom: string) => Promise<void>
  onSupprimerListe?: (id: string) => Promise<void>
}

export default function EpiceriesView({ epiceries, listes, onCreerListe, onAjouterEpicerie }: Props) {
  const navigate = useNavigate()
  const { height: vvHeight, offsetTop: vvOffsetTop } = useVisualViewport()
  const overlayStyle = { top: vvOffsetTop, height: vvHeight }
  const [showModal, setShowModal] = useState(false)
  const [modalEpicerie, setModalEpicerie] = useState<Epicerie | null>(null)
  const [nomListe, setNomListe] = useState('')
  const [showNouvelleEpicerie, setShowNouvelleEpicerie] = useState(false)
  const [nomEpicerie, setNomEpicerie] = useState('')

  const ouvrir = (epicerie: Epicerie) => {
    setModalEpicerie(epicerie)
    setNomListe('')
    setShowModal(true)
  }

  const creer = async () => {
    if (!modalEpicerie || !nomListe.trim()) return
    const id = await onCreerListe(modalEpicerie.id, modalEpicerie.nom, nomListe.trim())
    setShowModal(false)
    navigate(`/epicerie/${id}`)
  }

  const ajouterEpicerie = async () => {
    if (!nomEpicerie.trim()) return
    await onAjouterEpicerie(nomEpicerie.trim())
    setNomEpicerie('')
    setShowNouvelleEpicerie(false)
  }

  const listesParEpicerie = (epicerieId: string) =>
    listes.filter((l) => l.epicerieId === epicerieId)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white px-4 pt-safe pb-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Épicerie</h1>
          <button onClick={() => setShowNouvelleEpicerie(true)} className="text-orange-500">
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {epiceries.map((epi) => {
          const listesEpi = listesParEpicerie(epi.id)
          return (
            <div key={epi.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-orange-500" />
                  <span className="font-semibold text-gray-900">{epi.nom}</span>
                </div>
                <button
                  onClick={() => ouvrir(epi)}
                  className="flex items-center gap-1 text-xs text-orange-500 font-medium"
                >
                  <Plus size={14} /> Nouvelle liste
                </button>
              </div>
              {listesEpi.length === 0 ? (
                <div className="px-4 py-5 text-center">
                  <p className="text-xs text-gray-400">Aucune liste</p>
                </div>
              ) : (
                listesEpi.map((liste) => {
                  const restants = liste.articles.filter((a) => !a.estCoche).length
                  return (
                    <button
                      key={liste.id}
                      onClick={() => navigate(`/epicerie/${liste.id}`)}
                      className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0 active:bg-gray-50"
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{liste.nom}</p>
                        <p className="text-xs text-gray-400">{liste.articles.length} articles</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {restants > 0 && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {restants}
                          </span>
                        )}
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          )
        })}
      </div>

      {/* Modal nouvelle liste */}
      {showModal && modalEpicerie && (
        <div
          className="fixed left-0 right-0 z-[60] flex items-end bg-black/40"
          style={overlayStyle}
          onClick={() => setShowModal(false)}
        >
          <div className="bg-white w-full rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">Nouvelle liste</h3>
            <p className="text-sm text-gray-400 mb-4">{modalEpicerie.nom}</p>
            <input
              type="text"
              value={nomListe}
              onChange={(e) => setNomListe(e.target.value)}
              placeholder="Ex: Semaine du 3 juin"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && creer()}
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 rounded-2xl text-gray-700 font-semibold">
                Annuler
              </button>
              <button onClick={creer} className="flex-1 py-3 bg-orange-500 rounded-2xl text-white font-semibold">
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nouvelle épicerie */}
      {showNouvelleEpicerie && (
        <div
          className="fixed left-0 right-0 z-[60] flex items-end bg-black/40"
          style={overlayStyle}
          onClick={() => setShowNouvelleEpicerie(false)}
        >
          <div className="bg-white w-full rounded-t-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Ajouter un magasin</h3>
              <button onClick={() => setShowNouvelleEpicerie(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <input
              type="text"
              value={nomEpicerie}
              onChange={(e) => setNomEpicerie(e.target.value)}
              placeholder="Nom du magasin"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && ajouterEpicerie()}
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 mb-4"
            />
            <button onClick={ajouterEpicerie} className="w-full py-3 bg-orange-500 rounded-2xl text-white font-semibold">
              Ajouter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
