import { useState, useRef } from 'react'
import { X, Plus, Trash2, Camera } from 'lucide-react'
import type { Recette, CategorieRecette, Ingredient, RecetteExtraite } from '../../types'

type RecetteDraft = Omit<Recette, 'id' | 'dateAjout'>

interface Props {
  initial?: RecetteExtraite | Partial<RecetteDraft>
  onSave: (draft: RecetteDraft, photoFile?: File) => Promise<void>
  onCancel: () => void
  titre?: string
}

const CATEGORIES: CategorieRecette[] = ['Viande', 'Poisson', 'Végé', 'Pâtes', 'Soupe', 'Dessert', 'Autre']

function newIngredient(): Ingredient {
  return { id: crypto.randomUUID(), nom: '', quantite: '', unite: '', ordre: 0 }
}

export default function RecetteForm({ initial, onSave, onCancel, titre = 'Nouvelle recette' }: Props) {
  const [form, setForm] = useState<RecetteDraft>({
    titre: initial?.titre ?? '',
    instructions: initial?.instructions ?? [''],
    tempsPrepMinutes: initial?.tempsPrepMinutes ?? 0,
    tempsCuissonMinutes: initial?.tempsCuissonMinutes ?? 0,
    nbPortions: initial?.nbPortions ?? 4,
    categorie: (initial?.categorie as CategorieRecette) ?? 'Autre',
    notePersonnelle: initial?.notePersonnelle ?? '',
    photoURL: (initial as Partial<RecetteDraft>)?.photoURL ?? '',
    ingredients: (initial?.ingredients ?? [newIngredient()]).map((ing, i) => ({
      id: ('id' in ing && ing.id) ? ing.id as string : crypto.randomUUID(),
      nom: ing.nom ?? '',
      quantite: ing.quantite ?? '',
      unite: ing.unite ?? '',
      ordre: i,
    })),
  })
  const [photoFile, setPhotoFile] = useState<File | undefined>()
  const [photoPreview, setPhotoPreview] = useState<string>(form.photoURL)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const setField = <K extends keyof RecetteDraft>(k: K, v: RecetteDraft[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handlePhoto = (file: File) => {
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing) => ing.id === id ? { ...ing, [field]: value } : ing),
    }))
  }

  const ajouterIngredient = () => {
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { ...newIngredient(), ordre: f.ingredients.length }],
    }))
  }

  const supprimerIngredient = (id: string) => {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((i) => i.id !== id) }))
  }

  const updateInstruction = (i: number, val: string) => {
    const next = [...form.instructions]
    next[i] = val
    setForm((f) => ({ ...f, instructions: next }))
  }

  const ajouterInstruction = () => setForm((f) => ({ ...f, instructions: [...f.instructions, ''] }))
  const supprimerInstruction = (i: number) => setForm((f) => ({
    ...f,
    instructions: f.instructions.filter((_, idx) => idx !== i),
  }))

  const handleSave = async () => {
    if (!form.titre.trim()) return alert('Le titre est requis')
    setSaving(true)
    try {
      const cleaned: RecetteDraft = {
        ...form,
        ingredients: form.ingredients
          .filter((i) => i.nom.trim())
          .map((i, idx) => ({ ...i, ordre: idx })),
        instructions: form.instructions.filter((s) => s.trim()),
      }
      await onSave(cleaned, photoFile)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 z-10">
        <button onClick={onCancel} className="p-1">
          <X size={22} className="text-gray-500" />
        </button>
        <h2 className="font-bold text-lg">{titre}</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Photo */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-video bg-gray-100 flex flex-col items-center justify-center overflow-hidden relative"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={32} className="text-gray-300 mb-2" />
              <span className="text-xs text-gray-400">Ajouter une photo</span>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
        />

        <div className="p-4 space-y-5">
          {/* Titre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Titre</label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) => setField('titre', e.target.value)}
              placeholder="Nom de la recette"
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Catégorie</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setField('categorie', cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    form.categorie === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Temps + portions */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prép. (min)</label>
              <input
                type="number"
                value={form.tempsPrepMinutes || ''}
                onChange={(e) => setField('tempsPrepMinutes', Number(e.target.value))}
                min={0}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cuisson (min)</label>
              <input
                type="number"
                value={form.tempsCuissonMinutes || ''}
                onChange={(e) => setField('tempsCuissonMinutes', Number(e.target.value))}
                min={0}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Portions</label>
              <input
                type="number"
                value={form.nbPortions || ''}
                onChange={(e) => setField('nbPortions', Number(e.target.value))}
                min={1}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Ingrédients */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ingrédients</label>
            <div className="space-y-2">
              {form.ingredients.map((ing) => (
                <div key={ing.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={ing.quantite}
                    onChange={(e) => updateIngredient(ing.id, 'quantite', e.target.value)}
                    placeholder="Qté"
                    className="w-14 bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs text-center outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <input
                    type="text"
                    value={ing.unite}
                    onChange={(e) => updateIngredient(ing.id, 'unite', e.target.value)}
                    placeholder="ml/g..."
                    className="w-16 bg-white border border-gray-200 rounded-xl px-2 py-2 text-xs text-center outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <input
                    type="text"
                    value={ing.nom}
                    onChange={(e) => updateIngredient(ing.id, 'nom', e.target.value)}
                    placeholder="Ingrédient"
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button onClick={() => supprimerIngredient(ing.id)} className="p-1 text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={ajouterIngredient}
                className="flex items-center gap-2 text-orange-500 text-sm font-medium py-1"
              >
                <Plus size={16} /> Ajouter un ingrédient
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Étapes de préparation</label>
            <div className="space-y-2">
              {form.instructions.map((etape, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1.5">
                    {i + 1}
                  </div>
                  <textarea
                    value={etape}
                    onChange={(e) => updateInstruction(i, e.target.value)}
                    placeholder={`Étape ${i + 1}...`}
                    rows={2}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  {form.instructions.length > 1 && (
                    <button onClick={() => supprimerInstruction(i)} className="p-1 text-red-400 mt-1.5">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={ajouterInstruction}
                className="flex items-center gap-2 text-orange-500 text-sm font-medium py-1"
              >
                <Plus size={16} /> Ajouter une étape
              </button>
            </div>
          </div>

          {/* Note personnelle */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Note personnelle</label>
            <textarea
              value={form.notePersonnelle}
              onChange={(e) => setField('notePersonnelle', e.target.value)}
              placeholder="Astuces, variantes, souvenirs..."
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
