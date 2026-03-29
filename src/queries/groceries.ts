import { asc, desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { groceryItems } from '@/db/schema'

export async function getAllGroceryItems() {
  return db.query.groceryItems.findMany({
    with: { recipe: true },
    orderBy: [asc(groceryItems.checked), desc(groceryItems.checkedAt)],
  })
}

export async function getGroceryItemById(id: number) {
  return db.query.groceryItems.findFirst({
    where: eq(groceryItems.id, id),
    with: { recipe: true },
  })
}

export async function getUncheckedGroceryItems() {
  return db.query.groceryItems.findMany({
    where: eq(groceryItems.checked, false),
    with: { recipe: true },
    orderBy: [asc(groceryItems.name)],
  })
}
