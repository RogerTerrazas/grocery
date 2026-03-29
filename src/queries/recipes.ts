import { asc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { recipes } from '@/db/schema'

export async function getAllRecipes() {
  return db.query.recipes.findMany({
    orderBy: [asc(recipes.name)],
  })
}

export async function getRecipeById(id: number) {
  return db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: { groceryItems: true },
  })
}
