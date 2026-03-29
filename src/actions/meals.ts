'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { meals } from '@/db/schema'

export async function createMeal(data: {
  name: string
  servings: number
  date: Date
  recipeId?: number
}) {
  const [meal] = await db
    .insert(meals)
    .values({
      name: data.name,
      servings: data.servings,
      date: data.date,
      recipeId: data.recipeId ?? null,
    })
    .returning()
  revalidatePath('/planning')
  return meal
}

export async function updateMeal(
  id: number,
  data: {
    name?: string
    servings?: number
    date?: Date
    recipeId?: number | null
  }
) {
  await db.update(meals).set(data).where(eq(meals.id, id))
  revalidatePath('/planning')
}

export async function deleteMeal(id: number) {
  await db.delete(meals).where(eq(meals.id, id))
  revalidatePath('/planning')
}
