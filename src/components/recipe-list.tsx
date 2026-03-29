'use client'

import { Search, X } from 'lucide-react'
import { matchSorter } from 'match-sorter'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { Recipe } from '@/db/schema'

import { Button } from './ui/button'
import { Input } from './ui/input'

interface RecipeListProps {
  recipes: Recipe[]
}

export function RecipeList({ recipes }: RecipeListProps) {
  const [search, setSearch] = useState('')

  const filteredRecipes = useMemo(
    () =>
      search.trim()
        ? matchSorter(recipes, search, { keys: ['name'] })
        : recipes,
    [recipes, search]
  )

  const isFiltering = search.trim().length > 0

  return (
    <>
      <p className="text-muted-foreground text-sm mt-1">
        {isFiltering
          ? `${filteredRecipes.length} of ${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}`
          : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}`}
      </p>

      {recipes.length > 0 && (
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

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
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No matching recipes</p>
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-2 mt-4">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-secondary/50"
            >
              <span className="flex-1 min-w-0 font-medium text-sm truncate">
                {recipe.name}
              </span>
              <span className="text-muted-foreground text-xs shrink-0 ml-4">
                View →
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
