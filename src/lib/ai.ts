import { generateObject } from 'ai'
import { z } from 'zod'

// Vercel AI Gateway — routes to Anthropic Claude Sonnet
// Requires AI_GATEWAY_API_KEY env var
function getModel() {
  // @ts-ignore
  return 'anthropic/claude-sonnet-4-5' as const
}

const recipeSchema = z.object({
  name: z.string().describe('The name of the recipe'),
  ingredients: z
    .array(z.string())
    .describe(
      'List of ingredients with amounts, e.g. "2 cups flour", "1 tsp salt"'
    ),
})

export async function parseRecipeFromText(text: string) {
  const { object } = await generateObject({
    model: getModel() as unknown as Parameters<typeof generateObject>[0]['model'],
    schema: recipeSchema,
    prompt: `Extract the recipe name and ingredients from this text. Format each ingredient as a single string including the quantity and unit.\n\nText:\n${text}`,
  })
  return object
}

const groceryCategorySchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().describe('Category name, e.g. "Produce", "Dairy & Eggs"'),
      items: z.array(z.string()).describe('Item names in this category'),
    })
  ),
})

export type GroceryCategory = {
  name: string
  items: string[]
}

export async function categorizeGroceryItems(
  itemNames: string[]
): Promise<GroceryCategory[]> {
  if (itemNames.length === 0) return []

  const { object } = await generateObject({
    model: getModel() as unknown as Parameters<typeof generateObject>[0]['model'],
    schema: groceryCategorySchema,
    prompt: `Categorize these grocery items into typical grocery store sections like Produce, Dairy & Eggs, Meat & Seafood, Bakery, Pantry, Frozen, Beverages, etc.

Items:
${itemNames.map((item) => `- ${item}`).join('\n')}

Group them into logical categories. Only include categories that have at least one item.`,
  })

  return object.categories
}
