'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, isSameDay } from 'date-fns'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { fetchMealsByDateRange } from '@/actions/fetch'
import { createMeal, deleteMeal, updateMeal } from '@/actions/meals'
import type { Meal, Recipe } from '@/db/schema'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
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

type MealWithRecipe = Meal & { recipe: Recipe | null }

interface MealCalendarProps {
  initialMeals: MealWithRecipe[]
  recipes: Recipe[]
  startDate: Date
  endDate: Date
}

export function MealCalendar({
  initialMeals,
  recipes,
  startDate,
  endDate,
}: MealCalendarProps) {
  const queryClient = useQueryClient()
  const [addMealDate, setAddMealDate] = useState<Date | null>(null)
  const [editingMeal, setEditingMeal] = useState<MealWithRecipe | null>(null)
  const [newMealName, setNewMealName] = useState('')
  const [newMealServings, setNewMealServings] = useState('2')
  const [newMealRecipeId, setNewMealRecipeId] = useState<string>('')
  const [recipeSearch, setRecipeSearch] = useState('')

  const isEditing = editingMeal !== null
  const dialogOpen = addMealDate !== null || isEditing
  const dialogDate = isEditing ? editingMeal.date : addMealDate

  function resetForm() {
    setAddMealDate(null)
    setEditingMeal(null)
    setNewMealName('')
    setNewMealServings('2')
    setNewMealRecipeId('')
    setRecipeSearch('')
  }

  function openEditDialog(meal: MealWithRecipe) {
    setEditingMeal(meal)
    setNewMealName(meal.name)
    setNewMealServings(String(meal.servings))
    setNewMealRecipeId(meal.recipeId ? String(meal.recipeId) : '')
    setRecipeSearch(meal.recipe?.name ?? '')
  }

  const { data: meals } = useQuery({
    queryKey: ['meals'],
    queryFn: () => fetchMealsByDateRange(startDate, endDate),
    initialData: initialMeals,
  })

  const addMealMutation = useMutation({
    mutationFn: () => {
      if (!addMealDate) throw new Error('No date selected')
      const recipeId = newMealRecipeId ? Number(newMealRecipeId) : undefined
      return createMeal({
        name: newMealName.trim(),
        servings: Number(newMealServings) || 2,
        date: addMealDate,
        ...(recipeId !== undefined ? { recipeId } : {}),
      })
    },
    onMutate: async () => {
      if (!addMealDate) return
      await queryClient.cancelQueries({ queryKey: ['meals'] })
      const previous = queryClient.getQueryData<MealWithRecipe[]>(['meals'])
      const linkedRecipe = newMealRecipeId
        ? (recipes.find((r) => r.id === Number(newMealRecipeId)) ?? null)
        : null
      queryClient.setQueryData<MealWithRecipe[]>(['meals'], (old) => [
        ...(old ?? []),
        {
          id: Date.now(),
          name: newMealName.trim(),
          servings: Number(newMealServings) || 2,
          date: addMealDate,
          recipeId: newMealRecipeId ? Number(newMealRecipeId) : null,
          createdAt: new Date(),
          recipe: linkedRecipe,
        },
      ])
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['meals'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      resetForm()
    },
  })

  const deleteMealMutation = useMutation({
    mutationFn: (id: number) => deleteMeal(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['meals'] })
      const previous = queryClient.getQueryData<MealWithRecipe[]>(['meals'])
      queryClient.setQueryData<MealWithRecipe[]>(
        ['meals'],
        (old) => old?.filter((m) => m.id !== id) ?? []
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['meals'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
    },
  })

  const updateMealMutation = useMutation({
    mutationFn: () => {
      if (!editingMeal) throw new Error('No meal being edited')
      const recipeId = newMealRecipeId ? Number(newMealRecipeId) : null
      return updateMeal(editingMeal.id, {
        name: newMealName.trim(),
        servings: Number(newMealServings) || 2,
        recipeId,
      })
    },
    onMutate: async () => {
      if (!editingMeal) return
      await queryClient.cancelQueries({ queryKey: ['meals'] })
      const previous = queryClient.getQueryData<MealWithRecipe[]>(['meals'])
      const linkedRecipe = newMealRecipeId
        ? (recipes.find((r) => r.id === Number(newMealRecipeId)) ?? null)
        : null
      queryClient.setQueryData<MealWithRecipe[]>(['meals'], (old) =>
        (old ?? []).map((m) =>
          m.id === editingMeal.id
            ? {
                ...m,
                name: newMealName.trim(),
                servings: Number(newMealServings) || 2,
                recipeId: newMealRecipeId ? Number(newMealRecipeId) : null,
                recipe: linkedRecipe,
              }
            : m
        )
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['meals'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      resetForm()
    },
  })

  // Generate day list: yesterday + 7 days ahead
  const days = Array.from({ length: 9 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return d
  })

  const filteredRecipes = recipeSearch
    ? recipes.filter((r) =>
        r.name.toLowerCase().includes(recipeSearch.toLowerCase())
      )
    : recipes

  return (
    <div className="space-y-3">
      {days.map((day, idx) => {
        const dayMeals = meals.filter((m) => isSameDay(new Date(m.date), day))
        const isToday = isSameDay(day, new Date())
        const isYesterday = idx === 0

        return (
          <div
            key={day.toISOString()}
            className="rounded-lg border overflow-hidden"
          >
            {/* Day header */}
            <div
              className={`flex items-center justify-between px-4 py-2 ${
                isToday
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50'
              }`}
            >
              <div>
                <span className="font-semibold text-sm">
                  {isToday
                    ? 'Today'
                    : isYesterday
                      ? 'Yesterday'
                      : format(day, 'EEEE')}
                </span>
                <span
                  className={`ml-2 text-xs ${
                    isToday
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  }`}
                >
                  {format(day, 'MMM d')}
                </span>
              </div>
              <Button
                variant={isToday ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setAddMealDate(day)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Meals for this day */}
            {dayMeals.length > 0 && (
              <div className="divide-y">
                {dayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="group flex items-center justify-between px-4 py-2.5 hover:bg-secondary/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{meal.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {meal.servings} serving
                          {meal.servings !== 1 ? 's' : ''}
                        </span>
                        {meal.recipe && (
                          <Link href={`/recipes/${meal.recipe.id}`}>
                            <Badge
                              variant="outline"
                              className="text-xs cursor-pointer hover:bg-secondary"
                            >
                              {meal.recipe.name}
                            </Badge>
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(meal)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMealMutation.mutate(meal.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dayMeals.length === 0 && (
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-xs text-muted-foreground hover:bg-secondary/20 transition-colors"
                onClick={() => setAddMealDate(day)}
              >
                + Add meal
              </button>
            )}
          </div>
        )
      })}

      {/* Add / Edit meal dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Meal' : 'Add Meal'} —{' '}
              {dialogDate ? format(new Date(dialogDate), 'EEEE, MMM d') : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="recipe-search">Link to Recipe</Label>
              <Input
                id="recipe-search"
                placeholder="Search recipes..."
                value={recipeSearch}
                onChange={(e) => {
                  setRecipeSearch(e.target.value)
                  setNewMealRecipeId('')
                }}
                autoFocus
              />
              {recipeSearch &&
                filteredRecipes.length > 0 &&
                !newMealRecipeId && (
                  <div className="border rounded-md overflow-hidden max-h-40 overflow-y-auto">
                    {filteredRecipes.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
                        onClick={() => {
                          setNewMealRecipeId(String(r.id))
                          setNewMealName(r.name)
                          setRecipeSearch(r.name)
                        }}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
              {newMealRecipeId && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    ✓ Linked to recipe
                  </p>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                    onClick={() => {
                      setNewMealRecipeId('')
                      setRecipeSearch('')
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-name">Meal Name</Label>
              <Input
                id="meal-name"
                placeholder="e.g. Pasta Bolognese"
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                max="20"
                value={newMealServings}
                onChange={(e) => setNewMealServings(e.target.value)}
              />
            </div>
          </div>
          <Separator />
          <DialogFooter>
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            {isEditing ? (
              <Button
                onClick={() => updateMealMutation.mutate()}
                disabled={!newMealName.trim() || updateMealMutation.isPending}
              >
                {updateMealMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            ) : (
              <Button
                onClick={() => addMealMutation.mutate()}
                disabled={!newMealName.trim() || addMealMutation.isPending}
              >
                {addMealMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Add Meal
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
