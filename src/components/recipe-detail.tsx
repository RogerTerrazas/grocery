'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  createGroceryItem,
  deleteGroceryItem,
  toggleGroceryItem,
  updateGroceryItem,
} from '@/actions/groceries'
import { deleteRecipe, updateRecipe } from '@/actions/recipes'
import type { GroceryItem, Recipe } from '@/db/schema'
import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'

type RecipeWithItems = Recipe & { groceryItems: GroceryItem[] }

interface RecipeDetailProps {
  recipe: RecipeWithItems
}

export function RecipeDetail({ recipe: initialRecipe }: RecipeDetailProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [recipe, setRecipe] = useState(initialRecipe)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(recipe.name)
  const [newIngredient, setNewIngredient] = useState('')
  const [editingIngredientId, setEditingIngredientId] = useState<number | null>(
    null
  )
  const [editIngredientName, setEditIngredientName] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const updateNameMutation = useMutation({
    mutationFn: () => updateRecipe(recipe.id, editName),
    onSuccess: () => {
      setRecipe((r) => ({ ...r, name: editName }))
      setIsEditingName(false)
      // Keep the recipes list in sync
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })

  const deleteRecipeMutation = useMutation({
    mutationFn: () => deleteRecipe(recipe.id),
    onSuccess: () => router.push('/recipes'),
  })

  const addIngredientMutation = useMutation({
    mutationFn: () =>
      createGroceryItem({ name: newIngredient.trim(), recipeId: recipe.id }),
    onSuccess: () => {
      setRecipe((r) => ({
        ...r,
        groceryItems: [
          ...r.groceryItems,
          {
            id: Date.now(),
            name: newIngredient.trim(),
            recipeId: recipe.id,
            checked: false,
            checkedAt: null,
          },
        ],
      }))
      setNewIngredient('')
      queryClient.invalidateQueries({ queryKey: ['groceries'] })
    },
  })

  const toggleIngredientMutation = useMutation({
    mutationFn: ({ id, checked }: { id: number; checked: boolean }) =>
      toggleGroceryItem(id, checked),
    onMutate: ({ id, checked }) => {
      // Optimistic local update
      setRecipe((r) => ({
        ...r,
        groceryItems: r.groceryItems.map((i) =>
          i.id === id
            ? { ...i, checked, checkedAt: checked ? new Date() : null }
            : i
        ),
      }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['groceries'] })
    },
  })

  const updateIngredientMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateGroceryItem(id, name),
    onSuccess: (_data, { id, name }) => {
      setRecipe((r) => ({
        ...r,
        groceryItems: r.groceryItems.map((i) =>
          i.id === id ? { ...i, name } : i
        ),
      }))
      setEditingIngredientId(null)
      queryClient.invalidateQueries({ queryKey: ['groceries'] })
    },
  })

  const deleteIngredientMutation = useMutation({
    mutationFn: (id: number) => deleteGroceryItem(id),
    onSuccess: (_data, id) => {
      setRecipe((r) => ({
        ...r,
        groceryItems: r.groceryItems.filter((i) => i.id !== id),
      }))
      queryClient.invalidateQueries({ queryKey: ['groceries'] })
    },
  })

  function handleAddIngredient(e: React.FormEvent) {
    e.preventDefault()
    if (!newIngredient.trim()) return
    addIngredientMutation.mutate()
  }

  const onList = recipe.groceryItems.filter((i) => !i.checked).length
  const checked = recipe.groceryItems.filter((i) => i.checked).length

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      {/* Back button */}
      <Link
        href="/recipes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Recipes
      </Link>

      {/* Recipe name */}
      <div className="mb-6">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-xl font-bold h-auto py-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') updateNameMutation.mutate()
                if (e.key === 'Escape') setIsEditingName(false)
              }}
            />
            <Button
              size="sm"
              onClick={() => updateNameMutation.mutate()}
              disabled={updateNameMutation.isPending}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditingName(false)
                setEditName(recipe.name)
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <h1 className="text-2xl font-bold tracking-tight">{recipe.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditingName(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Ingredients */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ingredients
          </h2>
          <div className="flex items-center gap-2">
            {onList > 0 && (
              <Badge variant="secondary">{onList} on grocery list</Badge>
            )}
            {checked > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                {checked} checked off
              </Badge>
            )}
          </div>
        </div>

        {recipe.groceryItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No ingredients yet
          </p>
        ) : (
          <div className="space-y-1 mb-4">
            {recipe.groceryItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50',
                  item.checked && 'opacity-50'
                )}
              >
                {editingIngredientId === item.id ? (
                  <>
                    <Input
                      value={editIngredientName}
                      onChange={(e) => setEditIngredientName(e.target.value)}
                      className="flex-1 h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const trimmed = editIngredientName.trim()
                          if (trimmed && trimmed !== item.name) {
                            updateIngredientMutation.mutate({
                              id: item.id,
                              name: trimmed,
                            })
                          } else {
                            setEditingIngredientId(null)
                          }
                        }
                        if (e.key === 'Escape') {
                          setEditingIngredientId(null)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-8"
                      disabled={
                        !editIngredientName.trim() ||
                        updateIngredientMutation.isPending
                      }
                      onClick={() => {
                        const trimmed = editIngredientName.trim()
                        if (trimmed && trimmed !== item.name) {
                          updateIngredientMutation.mutate({
                            id: item.id,
                            name: trimmed,
                          })
                        } else {
                          setEditingIngredientId(null)
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => setEditingIngredientId(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(val) =>
                        toggleIngredientMutation.mutate({
                          id: item.id,
                          checked: val === true,
                        })
                      }
                    />
                    <span
                      className={cn(
                        'flex-1 text-sm',
                        item.checked && 'line-through text-muted-foreground'
                      )}
                    >
                      {item.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setEditingIngredientId(item.id)
                        setEditIngredientName(item.name)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => deleteIngredientMutation.mutate(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add ingredient */}
        <form onSubmit={handleAddIngredient} className="flex gap-2">
          <Input
            placeholder="Add ingredient..."
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newIngredient.trim() || addIngredientMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Separator className="my-6" />

      {/* Danger zone */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Danger Zone
        </Label>
        <div className="mt-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Recipe
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &ldquo;{recipe.name}&rdquo;? This
            will also remove all associated grocery items.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteRecipeMutation.mutate()}
              disabled={deleteRecipeMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
