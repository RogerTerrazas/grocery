'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/db'
import { groceryItems } from '@/db/schema'

export async function createGroceryItem(data: {
  name: string
  recipeId?: number
}) {
  await db.insert(groceryItems).values({
    name: data.name,
    recipeId: data.recipeId ?? null,
    checked: false,
  })
  revalidatePath('/groceries')
}

export async function toggleGroceryItem(id: number, checked: boolean) {
  await db
    .update(groceryItems)
    .set({
      checked,
      checkedAt: checked ? new Date() : null,
    })
    .where(eq(groceryItems.id, id))
  revalidatePath('/groceries')
}

export async function updateGroceryItem(id: number, name: string) {
  await db
    .update(groceryItems)
    .set({ name })
    .where(eq(groceryItems.id, id))
  revalidatePath('/groceries')
}

export async function deleteGroceryItem(id: number) {
  await db.delete(groceryItems).where(eq(groceryItems.id, id))
  revalidatePath('/groceries')
}
