'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, isSameDay } from 'date-fns'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { createMeal, deleteMeal } from '@/actions/meals'
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
}: MealCalendarProps) {
  const queryClient = useQueryClient()
  const [addMealDate, setAddMealDate] = useState<Date | null>(null)
  const [newMealName, setNewMealName] = useState('')
  const [newMealServings, setNewMealServings] = useState('2')
  const [newMealRecipeId, setNewMealRecipeId] = useState<string>('')
  const [recipeSearch, setRecipeSearch] = useState('')

  const { data: meals } = useQuery({
    queryKey: ['meals'],
    queryFn: async () => initialMeals,
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
      setAddMealDate(null)
      setNewMealName('')
      setNewMealServings('2')
      setNewMealRecipeId('')
      setRecipeSearch('')
    },
  })

  const deleteMealMutation = useMutation({
    mutationFn: (id: number) => deleteMeal(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['meals'] })
      const previous =
        queryClient.getQueryData<MealWithRecipe[]>(['meals'])
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
          <div key={day.toISOString()} className="rounded-lg border overflow-hidden">
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
                    isToday ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMealMutation.mutate(meal.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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

      {/* Add meal dialog */}
      <Dialog
        open={addMealDate !== null}
        onOpenChange={(open) => !open && setAddMealDate(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Meal —{' '}
              {addMealDate
                ? format(addMealDate, 'EEEE, MMM d')
                : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="meal-name">Meal Name</Label>
              <Input
                id="meal-name"
                placeholder="e.g. Pasta Bolognese"
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
                autoFocus
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
            <div className="space-y-2">
              <Label htmlFor="recipe-search">Link to Recipe (optional)</Label>
              <Input
                id="recipe-search"
                placeholder="Search recipes..."
                value={recipeSearch}
                onChange={(e) => {
                  setRecipeSearch(e.target.value)
                  setNewMealRecipeId('')
                }}
              />
              {recipeSearch && filteredRecipes.length > 0 && (
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
                <p className="text-xs text-muted-foreground">
                  ✓ Linked to recipe
                </p>
              )}
            </div>
          </div>
          <Separator />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddMealDate(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => addMealMutation.mutate()}
              disabled={!newMealName.trim() || addMealMutation.isPending}
            >
              {addMealMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Add Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
