'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { startTransition, useState } from 'react'

import { fetchGroceryItems } from '@/actions/fetch'
import {
  createGroceryItem,
  deleteGroceryItem,
  toggleGroceryItem,
} from '@/actions/groceries'
import { categorizeGroceryItemsAction } from '@/actions/groceries-ai'
import type { GroceryCategory } from '@/lib/ai'
import type { GroceryItem, Recipe } from '@/db/schema'
import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Separator } from './ui/separator'

type GroceryItemWithRecipe = GroceryItem & { recipe: Recipe | null }

interface GroceryListProps {
  initialItems: GroceryItemWithRecipe[]
  initialCategories: GroceryCategory[]
}

export function GroceryList({
  initialItems,
  initialCategories,
}: GroceryListProps) {
  const queryClient = useQueryClient()
  const [newItemName, setNewItemName] = useState('')

  const { data: items } = useQuery({
    queryKey: ['groceries'],
    queryFn: () => fetchGroceryItems(),
    initialData: initialItems,
  })

  // Categories are derived from unchecked item names — re-fetched any time
  // the grocery list changes
  const uncheckedItems = items.filter((i) => !i.checked)
  // Stable serialised key so React Query only refetches when names actually change
  const uncheckedNamesKey = uncheckedItems.map((i) => i.name).sort().join('|')

  const { data: categories, isFetching: isRecategorizing } = useQuery({
    queryKey: ['grocery-categories', uncheckedNamesKey],
    queryFn: () =>
      categorizeGroceryItemsAction(uncheckedItems.map((i) => i.name)),
    initialData: initialCategories,
    staleTime: Number.POSITIVE_INFINITY,
  })

  // Build sections in a single pass. Use a Set of assigned IDs as the sole
  // source of truth — an item can only ever be assigned once, regardless of
  // how many categories the AI places its name in.
  const { sections, uncategorized } = (() => {
    const assignedIds = new Set<number>()

    const sections = categories
      .map((cat) => {
        const catItems = cat.items.flatMap((name) =>
          // Find ALL unassigned items whose name matches (handles duplicates)
          uncheckedItems.filter(
            (i) =>
              !assignedIds.has(i.id) &&
              i.name.toLowerCase() === name.toLowerCase()
          )
        )
        // Dedup within catItems themselves (same name appears twice in cat.items)
        const seen = new Set<number>()
        const uniqueCatItems = catItems.filter((i) => {
          if (seen.has(i.id)) return false
          seen.add(i.id)
          return true
        })
        for (const item of uniqueCatItems) assignedIds.add(item.id)
        return { name: cat.name, items: uniqueCatItems }
      })
      .filter((s) => s.items.length > 0)

    const uncategorized = uncheckedItems.filter((i) => !assignedIds.has(i.id))
    return { sections, uncategorized }
  })()

  const checkedItems = items
    .filter((i) => i.checked)
    .sort(
      (a, b) =>
        (b.checkedAt?.getTime() ?? 0) - (a.checkedAt?.getTime() ?? 0)
    )

  const toggleMutation = useMutation({
    mutationFn: ({ id, checked }: { id: number; checked: boolean }) =>
      toggleGroceryItem(id, checked),
    onMutate: async ({ id, checked }) => {
      await queryClient.cancelQueries({ queryKey: ['groceries'] })
      const previous = queryClient.getQueryData<GroceryItemWithRecipe[]>([
        'groceries',
      ])
      queryClient.setQueryData<GroceryItemWithRecipe[]>(
        ['groceries'],
        (old) =>
          old?.map((item) =>
            item.id === id
              ? { ...item, checked, checkedAt: checked ? new Date() : null }
              : item
          ) ?? []
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['groceries'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['groceries'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGroceryItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['groceries'] })
      const previous = queryClient.getQueryData<GroceryItemWithRecipe[]>([
        'groceries',
      ])
      queryClient.setQueryData<GroceryItemWithRecipe[]>(
        ['groceries'],
        (old) => old?.filter((item) => item.id !== id) ?? []
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['groceries'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['groceries'] })
    },
  })

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    const name = newItemName.trim()
    if (!name) return
    setNewItemName('')
    startTransition(async () => {
      await createGroceryItem({ name })
      queryClient.invalidateQueries({ queryKey: ['groceries'] })
    })
  }

  return (
    <div className="space-y-4">
      {/* Add item form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          placeholder="Add item..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!newItemName.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Re-categorizing indicator */}
      {isRecategorizing && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Updating categories…
        </div>
      )}

      {/* Categorized unchecked items */}
      {uncheckedItems.length === 0 && checkedItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCartEmpty />
          <p className="mt-2 text-sm">Your grocery list is empty</p>
          <p className="text-xs mt-1">Add items above to get started</p>
        </div>
      ) : uncheckedItems.length > 0 ? (
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.name}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                {section.name}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggle={(checked) =>
                      toggleMutation.mutate({ id: item.id, checked })
                    }
                    onDelete={() => deleteMutation.mutate(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
          {uncategorized.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                Other
              </h3>
              <div className="space-y-1">
                {uncategorized.map((item) => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggle={(checked) =>
                      toggleMutation.mutate({ id: item.id, checked })
                    }
                    onDelete={() => deleteMutation.mutate(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Recently completed */}
      {checkedItems.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Recently Completed
            </h3>
            <div className="space-y-1">
              {checkedItems.map((item) => (
                <GroceryItemRow
                  key={item.id}
                  item={item}
                  onToggle={(checked) =>
                    toggleMutation.mutate({ id: item.id, checked })
                  }
                  onDelete={() => deleteMutation.mutate(item.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function GroceryItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: GroceryItemWithRecipe
  onToggle: (checked: boolean) => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50',
        item.checked && 'opacity-50'
      )}
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={(val) => onToggle(val === true)}
      />
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm truncate block',
            item.checked && 'line-through text-muted-foreground'
          )}
        >
          {item.name}
        </span>
        {item.recipe && (
          <Link href={`/recipes/${item.recipe.id}`}>
            <Badge
              variant="outline"
              className="text-xs cursor-pointer hover:bg-secondary mt-0.5"
            >
              {item.recipe.name}
            </Badge>
          </Link>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function ShoppingCartEmpty() {
  return (
    <div className="flex justify-center">
      <svg
        aria-label="Empty shopping cart"
        className="h-12 w-12 text-muted-foreground/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
    </div>
  )
}
