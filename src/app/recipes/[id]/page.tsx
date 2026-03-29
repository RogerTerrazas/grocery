import { notFound } from 'next/navigation'

import { RecipeDetail } from '@/components/recipe-detail'
import { getRecipeById } from '@/queries/recipes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params
  const recipeId = Number(id)

  if (Number.isNaN(recipeId)) notFound()

  const recipe = await getRecipeById(recipeId)

  if (!recipe) notFound()

  return <RecipeDetail recipe={recipe} />
}
