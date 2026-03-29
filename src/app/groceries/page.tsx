import { Suspense } from 'react'

import { GroceryList } from '@/components/grocery-list'
import { Skeleton } from '@/components/ui/skeleton'
import { getAllGroceryItems } from '@/queries/groceries'
import { getAllRecipes } from '@/queries/recipes'

export const dynamic = 'force-dynamic'

export default async function GroceriesPage() {
  const [items, recipes] = await Promise.all([
    getAllGroceryItems(),
    getAllRecipes(),
  ])

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Groceries</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {items.filter((i) => !i.checked).length} items remaining
        </p>
      </div>
      <Suspense fallback={<GroceryListSkeleton />}>
        <GroceryList initialItems={items} recipes={recipes} />
      </Suspense>
    </div>
  )
}

function GroceryListSkeleton() {
  return (
    <div className="space-y-2">
      {(['a', 'b', 'c', 'd', 'e'] as const).map((k) => (
        <Skeleton key={k} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  )
}
