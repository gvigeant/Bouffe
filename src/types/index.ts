import type { Timestamp } from 'firebase/firestore'

export type CategorieRecette = 'Viande' | 'Poisson' | 'Végé' | 'Pâtes' | 'Soupe' | 'Dessert' | 'Autre'

export interface Ingredient {
  id: string
  nom: string
  quantite: string
  unite: string
  ordre: number
}

export interface Recette {
  id: string
  titre: string
  instructions: string[]
  tempsPrepMinutes: number
  tempsCuissonMinutes: number
  nbPortions: number
  categorie: CategorieRecette
  notePersonnelle: string
  photoURL: string
  ingredients: Ingredient[]
  dateAjout: Timestamp | null
}

export interface Article {
  id: string
  nom: string
  quantite: string
  unite: string
  estCoche: boolean
  ordre: number
  recetteSourceId?: string
}

export interface Epicerie {
  id: string
  nom: string
  estPredéfinie: boolean
  ordre: number
}

export interface Liste {
  id: string
  epicerieId: string
  epicerieNom: string
  nom: string
  dateCreation: Timestamp | null
  articles: Article[]
}

export interface Special {
  id: string
  produit: string
  prixOriginal: number | null
  prixSolde: number | null
  epicerieNom: string
  semaine: string
  notes: string
}

export interface Souper {
  id: string
  date: string
  recetteId: string | null
  recetteTitre: string
  nomLibre: string
}

export interface AppSettings {
  claudeApiKey: string
}

export interface RecetteExtraite {
  titre: string
  instructions: string[]
  tempsPrepMinutes: number
  tempsCuissonMinutes: number
  nbPortions: number
  categorie: CategorieRecette
  notePersonnelle: string
  ingredients: Omit<Ingredient, 'id'>[]
}
