import { CreateRecipeForm } from '@/components/create-recipe-form'

export default function CreateRecipePage() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">New Recipe</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create manually or paste recipe text to extract with AI
        </p>
      </div>
      <CreateRecipeForm />
    </div>
  )
}
