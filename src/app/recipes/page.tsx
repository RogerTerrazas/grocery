import { Plus } from 'lucide-react'
import Link from 'next/link'

import { RecipeList } from '@/components/recipe-list'
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
        </div>
        <Button asChild size="sm">
          <Link href="/recipes/create">
            <Plus className="h-4 w-4" />
            New Recipe
          </Link>
        </Button>
      </div>

      <RecipeList recipes={recipes} />
    </div>
  )
}
