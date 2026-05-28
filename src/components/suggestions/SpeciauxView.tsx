import { useState } from 'react'
import { Plus, Trash2, Tag } from 'lucide-react'
import type { Special } from '../../types'

interface Props {
  speciaux: Special[]
  semaine: string
  onAjouter: (produit: string, epicerieNom: string, prixOriginal: number | null, prixSolde: number | null, notes: string) => Promise<void>
  onSupprimer: (id: string) => Promise<void>
}

const MAGASINS = ['IGA', 'Maxi', 'Costco', 'Metro', 'Autre']

export default function SpeciauxView({ speciaux, onAjouter, onSupprimer }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [produit, setProduit] = useState('')
  const [magasin, setMagasin] = useState('IGA')
  const [prixOriginal, setPrixOriginal] = useState('')
  const [prixSolde, setPrixSolde] = useState('')
  const [notes, setNotes] = useState('')

  const reset = () => {
    setProduit(''); setMagasin('IGA'); setPrixOriginal(''); setPrixSolde(''); setNotes('')
  }

  const sauvegarder = async () => {
    if (!produit.trim()) return
    await onAjouter(
      produit.trim(),
      magasin,
      prixOriginal ? Number(prixOriginal) : null,
      prixSolde ? Number(prixSolde) : null,
      notes
    )
    reset()
    setShowForm(false)
  }

  const parMagasin = speciaux.reduce<Record<string, Special[]>>((acc, s) => {
    if (!acc[s.epicerieNom]) acc[s.epicerieNom] = []
    acc[s.epicerieNom].push(s)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-800">Spéciaux de la semaine</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-orange-500 text-sm font-medium"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm space-y-3">
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1 block">Produit</label>
            <input
              type="text"
              value={produit}
              onChange={(e) => setProduit(e.target.value)}
              placeholder="Ex: Poulet entier"
              className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {MAGASINS.map((m) => (
              <button
                key={m}
                onClick={() => setMagasin(m)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                  magasin === m ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">Prix original</label>
              <input
                type="number"
                value={prixOriginal}
                onChange={(e) => setPrixOriginal(e.target.value)}
                placeholder="0.00"
                min={0}
                step={0.01}
                className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">Prix soldé</label>
              <input
                type="number"
                value={prixSolde}
                onChange={(e) => setPrixSolde(e.target.value)}
                placeholder="0.00"
                min={0}
                step={0.01}
                className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optionnel)"
            className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); reset() }} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-gray-600 text-sm font-medium">
              Annuler
            </button>
            <button onClick={sauvegarder} className="flex-1 py-2.5 bg-orange-500 rounded-xl text-white text-sm font-semibold">
              Ajouter
            </button>
          </div>
        </div>
      )}

      {Object.keys(parMagasin).length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
          <Tag size={28} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Aucun spécial cette semaine</p>
          <p className="text-xs text-gray-300 mt-1">Ajoutez les promotions des circulaires</p>
        </div>
      ) : (
        Object.entries(parMagasin).map(([mag, items]) => (
          <div key={mag} className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{mag}</p>
            </div>
            {items.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{s.produit}</p>
                  {(s.prixOriginal != null || s.prixSolde != null) && (
                    <p className="text-xs text-gray-400">
                      {s.prixOriginal != null && <span className="line-through mr-1">{s.prixOriginal}$</span>}
                      {s.prixSolde != null && <span className="text-green-600 font-medium">{s.prixSolde}$</span>}
                    </p>
                  )}
                  {s.notes && <p className="text-xs text-gray-400 italic">{s.notes}</p>}
                </div>
                <button onClick={() => onSupprimer(s.id)} className="p-1 text-red-300">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
