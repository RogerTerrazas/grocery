import { Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { getAllRecipes } from '@/queries/recipes'

export const dynamic = 'force-dynamic'

export default async function RecipesPage() {
  const recipes = await getAllRecipes()

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/recipes/create">
            <Plus className="h-4 w-4" />
            New Recipe
          </Link>
        </Button>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No recipes yet</p>
          <p className="text-xs mt-1">
            Create your first recipe to get started
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/recipes/create">Create Recipe</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-secondary/50"
            >
              <span className="font-medium text-sm">{recipe.name}</span>
              <span className="text-muted-foreground text-xs">View →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
