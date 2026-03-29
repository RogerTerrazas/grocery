'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { groceryItems, recipes } from '@/db/schema'
import { parseRecipeFromText } from '@/lib/ai'

export async function createRecipe(name: string) {
  const [recipe] = await db.insert(recipes).values({ name }).returning()
  revalidatePath('/recipes')
  return recipe
}

export async function updateRecipe(id: number, name: string) {
  await db.update(recipes).set({ name }).where(eq(recipes.id, id))
  revalidatePath('/recipes')
  revalidatePath(`/recipes/${id}`)
}

export async function deleteRecipe(id: number) {
  await db.delete(recipes).where(eq(recipes.id, id))
  revalidatePath('/recipes')
}

export async function createRecipeFromText(text: string) {
  const parsed = await parseRecipeFromText(text)

  // Create the recipe
  const [recipe] = await db
    .insert(recipes)
    .values({ name: parsed.name })
    .returning()

  if (!recipe) throw new Error('Failed to create recipe')

  // Create grocery items for each ingredient
  if (parsed.ingredients.length > 0) {
    await db.insert(groceryItems).values(
      parsed.ingredients.map((ingredient) => ({
        name: ingredient,
        recipeId: recipe.id,
        checked: false,
      }))
    )
  }

  revalidatePath('/recipes')
  revalidatePath('/groceries')
  return recipe
}
