'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { startTransition, useState } from 'react'

import {
  createGroceryItem,
  deleteGroceryItem,
  toggleGroceryItem,
} from '@/actions/groceries'
import { categorizeGroceryItemsAction } from '@/actions/groceries-ai'
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
  recipes?: Recipe[]
}

export function GroceryList({ initialItems }: GroceryListProps) {
  const queryClient = useQueryClient()
  const [newItemName, setNewItemName] = useState('')
  const [isCategorizing, setIsCategorizing] = useState(false)
  const [categories, setCategories] = useState<
    { name: string; items: string[] }[] | null
  >(null)

  const { data: items } = useQuery({
    queryKey: ['groceries'],
    queryFn: async () => initialItems,
    initialData: initialItems,
  })

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

  const uncheckedItems = items.filter((i) => !i.checked)
  const checkedItems = items
    .filter((i) => i.checked)
    .sort(
      (a, b) =>
        (b.checkedAt?.getTime() ?? 0) - (a.checkedAt?.getTime() ?? 0)
    )

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    const name = newItemName.trim()
    if (!name) return
    setNewItemName('')
    setCategories(null)
    startTransition(async () => {
      await createGroceryItem({ name })
      queryClient.invalidateQueries({ queryKey: ['groceries'] })
    })
  }

  async function handleCategorize() {
    const uncheckedNames = uncheckedItems.map((i) => i.name)
    if (uncheckedNames.length === 0) return
    setIsCategorizing(true)
    try {
      const result = await categorizeGroceryItemsAction(uncheckedNames)
      setCategories(result)
    } finally {
      setIsCategorizing(false)
    }
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

      {/* AI categorize button */}
      {uncheckedItems.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCategorize}
          disabled={isCategorizing}
          className="w-full gap-2"
        >
          {isCategorizing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isCategorizing ? 'Categorizing...' : 'Categorize with AI'}
        </Button>
      )}

      {/* Categorized view */}
      {categories ? (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.name}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {cat.name}
              </h3>
              <div className="space-y-1">
                {cat.items.map((itemName) => {
                  const item = uncheckedItems.find(
                    (i) => i.name.toLowerCase() === itemName.toLowerCase()
                  )
                  if (!item) return null
                  return (
                    <GroceryItemRow
                      key={item.id}
                      item={item}
                      onToggle={(checked) =>
                        toggleMutation.mutate({ id: item.id, checked })
                      }
                      onDelete={() => deleteMutation.mutate(item.id)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Default flat list */
        <div className="space-y-1">
          {uncheckedItems.map((item) => (
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
      )}

      {/* Recently completed */}
      {checkedItems.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
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

      {items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCartEmpty />
          <p className="mt-2 text-sm">Your grocery list is empty</p>
          <p className="text-xs mt-1">Add items above to get started</p>
        </div>
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
