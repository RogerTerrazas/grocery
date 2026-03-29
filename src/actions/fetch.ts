'use server'

import { getAllGroceryItems } from '@/queries/groceries'
import { getMealsByDateRange } from '@/queries/meals'

export async function fetchGroceryItems() {
  return getAllGroceryItems()
}

export async function fetchMealsByDateRange(
  startDate: Date,
  endDate: Date
) {
  return getMealsByDateRange(startDate, endDate)
}
