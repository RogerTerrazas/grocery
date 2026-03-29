import { and, asc, between, eq } from 'drizzle-orm'

import { db } from '@/db'
import { meals } from '@/db/schema'

export async function getAllMeals() {
  return db.query.meals.findMany({
    with: { recipe: true },
    orderBy: [asc(meals.date)],
  })
}

export async function getMealById(id: number) {
  return db.query.meals.findFirst({
    where: eq(meals.id, id),
    with: { recipe: true },
  })
}

export async function getMealsByDateRange(startDate: Date, endDate: Date) {
  return db.query.meals.findMany({
    where: and(between(meals.date, startDate, endDate)),
    with: { recipe: true },
    orderBy: [asc(meals.date)],
  })
}
