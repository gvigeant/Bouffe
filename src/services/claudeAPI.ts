import type { Special, Recette } from '../types'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

async function callClaude(apiKey: string, messages: object[], maxTokens = 2000): Promise<string> {
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Erreur Claude API: ${res.status}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

export async function suggererRecettes(
  apiKey: string,
  speciaux: Special[],
  recettes: Recette[],
  planActuel: string[]
): Promise<string> {
  const speciauxParMagasin = speciaux.reduce<Record<string, string[]>>((acc, s) => {
    if (!acc[s.epicerieNom]) acc[s.epicerieNom] = []
    const prix = s.prixSolde != null ? ` (${s.prixSolde}$)` : ''
    acc[s.epicerieNom].push(`${s.produit}${prix}`)
    return acc
  }, {})

  const speciauxTexte = Object.entries(speciauxParMagasin)
    .map(([mag, items]) => `${mag}: ${items.join(', ')}`)
    .join('\n')

  const recettesTexte = recettes
    .slice(0, 40)
    .map((r) => r.titre)
    .join(', ')

  const planTexte = planActuel.length > 0 ? `Déjà planifié: ${planActuel.join(', ')}` : ''

  const prompt = `Tu es un assistant culinaire québécois. Suggère 4-5 idées de soupers pour la semaine.

Spéciaux disponibles:
${speciauxTexte || 'Aucun spécial saisi'}

Recettes connues dans l'app: ${recettesTexte || 'Aucune recette enregistrée'}

${planTexte}

Règles:
- Essaie d'utiliser au moins un produit en spécial par suggestion
- Privilégie les recettes déjà connues si possible, sinon propose-en de nouvelles
- Indique clairement si tu utilises un spécial et de quel magasin
- Sois concis et pratique
- Réponds en français canadien

Format de réponse (JSON uniquement, pas de texte autour):
{
  "suggestions": [
    {
      "titre": "Nom du plat",
      "description": "Brève description 1-2 phrases",
      "speciaux": ["produit en spécial utilisé"],
      "magasin": "nom du magasin ou null",
      "estRecetteConnue": true,
      "ideeIngredients": ["ingrédient 1", "ingrédient 2"]
    }
  ]
}`

  return callClaude(apiKey, [{ role: 'user', content: prompt }], 1500)
}
