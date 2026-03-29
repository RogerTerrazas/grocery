'use server'

import type { GroceryCategory } from '@/lib/ai'
import { categorizeGroceryItems } from '@/lib/ai'

export async function categorizeGroceryItemsAction(
  itemNames: string[]
): Promise<GroceryCategory[]> {
  return categorizeGroceryItems(itemNames)
}
