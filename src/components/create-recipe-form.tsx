'use client'

import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { createRecipe, createRecipeFromText } from '@/actions/recipes'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Textarea } from './ui/textarea'

type Mode = 'manual' | 'ai'

export function CreateRecipeForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('manual')
  const [name, setName] = useState('')
  const [pastedText, setPastedText] = useState('')

  const createManualMutation = useMutation({
    mutationFn: () => createRecipe(name.trim()),
    onSuccess: (recipe) => {
      if (recipe) router.push(`/recipes/${recipe.id}`)
    },
  })

  const createAiMutation = useMutation({
    mutationFn: () => createRecipeFromText(pastedText.trim()),
    onSuccess: (recipe) => {
      if (recipe) router.push(`/recipes/${recipe.id}`)
    },
  })

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createManualMutation.mutate()
  }

  function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pastedText.trim()) return
    createAiMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <Link
        href="/recipes"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Recipes
      </Link>

      {/* Mode toggle */}
      <div className="flex rounded-lg border overflow-hidden">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'manual'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary/50 text-muted-foreground'
          }`}
        >
          Manual
        </button>
        <button
          type="button"
          onClick={() => setMode('ai')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            mode === 'ai'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary/50 text-muted-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Extract
        </button>
      </div>

      <Separator />

      {mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Recipe Name</Label>
            <Input
              id="name"
              placeholder="e.g. Chicken Tikka Masala"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <p className="text-xs text-muted-foreground">
            You can add ingredients after creating the recipe.
          </p>
          <Button
            type="submit"
            disabled={!name.trim() || createManualMutation.isPending}
            className="w-full"
          >
            {createManualMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Create Recipe
          </Button>
          {createManualMutation.isError && (
            <p className="text-sm text-destructive">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      ) : (
        <form onSubmit={handleAiSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-text">Paste Recipe Text</Label>
            <Textarea
              id="recipe-text"
              placeholder="Paste any recipe text here — from a website, cookbook, email, etc. AI will extract the name and ingredients."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={8}
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={!pastedText.trim() || createAiMutation.isPending}
            className="w-full gap-2"
          >
            {createAiMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {createAiMutation.isPending ? 'Extracting...' : 'Extract with AI'}
          </Button>
          {createAiMutation.isError && (
            <p className="text-sm text-destructive">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      )}
    </div>
  )
}
