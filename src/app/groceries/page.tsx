import { Suspense } from 'react'

import { GroceryList } from '@/components/grocery-list'
import { Skeleton } from '@/components/ui/skeleton'
import { categorizeGroceryItems } from '@/lib/ai'
import { getAllGroceryItems } from '@/queries/groceries'

export const dynamic = 'force-dynamic'

export default async function GroceriesPage() {
  const items = await getAllGroceryItems()

  const uncheckedNames = items
    .filter((i) => !i.checked)
    .map((i) => i.name)

  const categories = await categorizeGroceryItems(uncheckedNames)

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Groceries</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {uncheckedNames.length} item{uncheckedNames.length !== 1 ? 's' : ''}{' '}
          remaining
        </p>
      </div>
      <Suspense fallback={<GroceryListSkeleton />}>
        <GroceryList initialItems={items} initialCategories={categories} />
      </Suspense>
    </div>
  )
}

function GroceryListSkeleton() {
  return (
    <div className="space-y-4">
      {(['a', 'b', 'c'] as const).map((k) => (
        <div key={k} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          {(['x', 'y'] as const).map((j) => (
            <Skeleton key={j} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  )
}
