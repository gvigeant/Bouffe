import type { RecetteExtraite } from '../types'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `Tu es un assistant qui extrait des recettes et les retourne en JSON structuré.
Réponds UNIQUEMENT avec du JSON valide, sans texte autour, sans bloc de code.
Format requis:
{
  "titre": "Nom de la recette",
  "ingredients": [
    { "nom": "farine", "quantite": "250", "unite": "ml", "ordre": 1 }
  ],
  "instructions": ["Étape 1...", "Étape 2..."],
  "tempsPrepMinutes": 15,
  "tempsCuissonMinutes": 30,
  "nbPortions": 4,
  "categorie": "Viande",
  "notePersonnelle": ""
}
Catégories valides: Viande, Poisson, Végé, Pâtes, Soupe, Dessert, Autre
Si une valeur est inconnue, utilise 0 pour les nombres, "" pour les chaînes.`

async function callClaude(
  apiKey: string,
  messages: object[]
): Promise<RecetteExtraite> {
  const res = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Erreur Claude API: ${res.status}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text ?? '{}'
  const parsed = JSON.parse(text)

  return {
    titre: parsed.titre ?? '',
    ingredients: (parsed.ingredients ?? []).map((ing: Record<string, unknown>, i: number) => ({
      nom: String(ing.nom ?? ''),
      quantite: String(ing.quantite ?? ''),
      unite: String(ing.unite ?? ''),
      ordre: Number(ing.ordre ?? i + 1),
    })),
    instructions: Array.isArray(parsed.instructions)
      ? parsed.instructions.map(String)
      : [String(parsed.instructions ?? '')],
    tempsPrepMinutes: Number(parsed.tempsPrepMinutes ?? 0),
    tempsCuissonMinutes: Number(parsed.tempsCuissonMinutes ?? 0),
    nbPortions: Number(parsed.nbPortions ?? 4),
    categorie: parsed.categorie ?? 'Autre',
    notePersonnelle: parsed.notePersonnelle ?? '',
  }
}

export async function extraireDepuisTexte(apiKey: string, texte: string): Promise<RecetteExtraite> {
  return callClaude(apiKey, [
    {
      role: 'user',
      content: `Extrais la recette de ce texte:\n\n${texte}`,
    },
  ])
}

export async function extraireDepuisHTML(apiKey: string, html: string): Promise<RecetteExtraite> {
  const htmlTrunc = html.slice(0, 15000)
  return callClaude(apiKey, [
    {
      role: 'user',
      content: `Extrais la recette de ce HTML de page web:\n\n${htmlTrunc}`,
    },
  ])
}

export async function extraireDepuisPhoto(
  apiKey: string,
  imageBase64: string,
  mimeType: string
): Promise<RecetteExtraite> {
  return callClaude(apiKey, [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: imageBase64,
          },
        },
        {
          type: 'text',
          text: "Extrais la recette visible dans cette image.",
        },
      ],
    },
  ])
}
