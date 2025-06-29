import { createTRPCRouter, publicProcedure } from "./trpc";
import { z } from "zod";
import { db } from "../../db";
import { groceryItems, recipes, meals } from "../../db/schema";
import { eq, gte, lte, and } from "drizzle-orm";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

// Define types for our API responses - updated to match new schema
interface GroceryItem {
  id: number;
  name: string;
  recipeId?: number | null;
  checked: boolean;
  checkedAt?: Date | null;
}

interface Recipe {
  id: number;
  name: string;
  groceryItems?: GroceryItem[];
}

export const appRouter = createTRPCRouter({
  hello: createTRPCRouter({
    greeting: publicProcedure
      .input(z.object({ name: z.string().optional() }))
      .query(({ input }) => {
        return {
          greeting: `Hello ${input.name ?? "world"}!`,
        };
      }),
  }),

  groceries: createTRPCRouter({
    getAll: publicProcedure.query(async () => {
      const items = await db.query.groceryItems.findMany({
        with: {
          recipe: true,
        },
      });
      return items;
    }),

    getFormatted: publicProcedure.query(async () => {
      // Get all grocery items with recipe data
      const items = await db.query.groceryItems.findMany({
        with: {
          recipe: true,
        },
      });

      // Separate checked and unchecked items
      const checkedItems = items.filter((item) => item.checked);
      const uncheckedItems = items.filter((item) => !item.checked);

      // Sort checked items by most recently checked (most recent first)
      const sortedCheckedItems = checkedItems.sort((a, b) => {
        if (!a.checkedAt && !b.checkedAt) return 0;
        if (!a.checkedAt) return 1;
        if (!b.checkedAt) return -1;
        return (
          new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
        );
      });

      // Categorize unchecked items using AI if there are any
      let categorizedUncheckedItems: any = {};

      if (uncheckedItems.length > 0) {
        try {
          // Define the schema for grocery store categorization
          const CategorizationSchema = z.object({
            categories: z
              .record(
                z.string(),
                z
                  .array(z.string())
                  .describe(
                    "Array of grocery item names that belong to this category"
                  )
              )
              .describe(
                "Object mapping category names to arrays of grocery item names"
              ),
          });

          // Extract just the item names for AI processing
          const itemNames = uncheckedItems.map((item) => item.name);

          // Use AI to categorize the items
          const result = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: CategorizationSchema,
            prompt: `
              Categorize the following grocery items into typical grocery store sections/categories.
              Use common grocery store department names like:
              - Produce (fruits, vegetables, herbs)
              - Dairy & Eggs
              - Meat & Seafood
              - Bakery
              - Pantry & Canned Goods
              - Frozen Foods
              - Beverages
              - Snacks & Candy
              - Health & Beauty
              - Household & Cleaning
              - Other

              Grocery items to categorize:
              ${itemNames.join(", ")}

              Group similar items together and use the most appropriate grocery store section name for each category.
              
              Return the result in this exact format:
              {
                "categories": {
                  "Category Name": ["item1", "item2"],
                  "Another Category": ["item3", "item4"]
                }
              }
            `,
          });

          const categorization = result.object;

          // Map the categorized item names back to full item objects
          categorizedUncheckedItems = {};

          for (const [category, itemNamesInCategory] of Object.entries(
            categorization.categories
          )) {
            categorizedUncheckedItems[category] = uncheckedItems.filter(
              (item) => itemNamesInCategory.includes(item.name)
            );
          }

          // Handle any items that weren't categorized (fallback)
          const categorizedItemNames = new Set(
            Object.values(categorization.categories).flat()
          );
          const uncategorizedItems = uncheckedItems.filter(
            (item) => !categorizedItemNames.has(item.name)
          );

          if (uncategorizedItems.length > 0) {
            categorizedUncheckedItems["Other"] = [
              ...(categorizedUncheckedItems["Other"] || []),
              ...uncategorizedItems,
            ];
          }
        } catch (error) {
          console.error("Error categorizing grocery items:", error);
          // Fallback: put all unchecked items in a single category
          categorizedUncheckedItems = {
            "Grocery Items": uncheckedItems,
          };
        }
      }

      return {
        checked: sortedCheckedItems,
        unchecked: categorizedUncheckedItems,
        totalItems: items.length,
        checkedCount: checkedItems.length,
        uncheckedCount: uncheckedItems.length,
      };
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const items = await db
          .select()
          .from(groceryItems)
          .where(eq(groceryItems.id, input.id));

        if (items.length === 0) {
          throw new Error("Grocery item not found");
        }
        return items[0];
      }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          recipeId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const newItems = await db
          .insert(groceryItems)
          .values({
            name: input.name,
            recipeId: input.recipeId || null,
          })
          .returning();

        return newItems[0];
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          recipeId: z.number().optional().nullable(),
          checked: z.boolean().optional(),
          checkedAt: z.date().optional().nullable(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        const updatedItems = await db
          .update(groceryItems)
          .set(updateData)
          .where(eq(groceryItems.id, id))
          .returning();

        if (updatedItems.length === 0) {
          throw new Error("Grocery item not found");
        }
        return updatedItems[0];
      }),

    toggleChecked: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // First get the current item to toggle its checked status
        const currentItems = await db
          .select()
          .from(groceryItems)
          .where(eq(groceryItems.id, input.id));

        if (currentItems.length === 0) {
          throw new Error("Grocery item not found");
        }

        const currentItem = currentItems[0];
        const newCheckedStatus = !currentItem.checked;
        const checkedAt = newCheckedStatus ? new Date() : null;

        const updatedItems = await db
          .update(groceryItems)
          .set({
            checked: newCheckedStatus,
            checkedAt: checkedAt,
          })
          .where(eq(groceryItems.id, input.id))
          .returning();

        return updatedItems[0];
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const deletedItems = await db
          .delete(groceryItems)
          .where(eq(groceryItems.id, input.id))
          .returning();

        if (deletedItems.length === 0) {
          throw new Error("Grocery item not found");
        }
        return deletedItems[0];
      }),
  }),

  recipes: createTRPCRouter({
    getAll: publicProcedure.query(async () => {
      const allRecipes = await db.query.recipes.findMany({
        with: {
          groceryItems: true,
        },
      });
      return allRecipes;
    }),

    processFromText: publicProcedure
      .input(z.object({ recipeText: z.string() }))
      .mutation(async ({ input }) => {
        // Define the schema for the structured recipe output
        const RecipeSchema = z.object({
          name: z.string().describe("The name of the recipe"),
          ingredients: z
            .array(
              z.object({
                name: z
                  .string()
                  .describe("The name of the ingredient/grocery item"),
                amount: z
                  .string()
                  .optional()
                  .describe('The amount needed (e.g., "2 cups", "1 lb")'),
                notes: z
                  .string()
                  .optional()
                  .describe("Any additional notes about the ingredient"),
              })
            )
            .describe("List of ingredients needed for the recipe"),
        });

        try {
          // Use Vercel AI with ChatGPT-4 mini to parse the recipe
          const result = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: RecipeSchema,
            prompt: `
              Parse the following recipe text and extract the recipe name and ingredients list.
              The recipe text may be in any format - it could be a paragraph, a list, or structured text.
              Extract all ingredients mentioned and try to identify quantities where possible.
              
              Recipe text:
              ${input.recipeText}
              
              Please provide:
              1. A clear recipe name
              2. A list of all ingredients with their amounts (if specified) and any relevant notes
            `,
          });

          const parsedRecipe = result.object;

          // Insert the recipe into the database
          const [newRecipe] = await db
            .insert(recipes)
            .values({
              name: parsedRecipe.name,
            })
            .returning();

          // Insert the grocery items linked to the recipe
          const groceryItemsToInsert = parsedRecipe.ingredients.map(
            (ingredient) => ({
              name: ingredient.amount
                ? `${ingredient.amount} ${ingredient.name}${
                    ingredient.notes ? ` (${ingredient.notes})` : ""
                  }`
                : `${ingredient.name}${
                    ingredient.notes ? ` (${ingredient.notes})` : ""
                  }`,
              recipeId: newRecipe.id,
              checked: false,
            })
          );

          const newGroceryItems = await db
            .insert(groceryItems)
            .values(groceryItemsToInsert)
            .returning();

          return {
            success: true,
            recipe: newRecipe,
            groceryItems: newGroceryItems,
            parsedData: parsedRecipe,
          };
        } catch (error) {
          console.error("Error processing recipe:", error);

          if (error instanceof Error) {
            throw new Error(`Failed to process recipe: ${error.message}`);
          }

          throw new Error("Internal server error while processing recipe");
        }
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const recipe = await db.query.recipes.findFirst({
          where: eq(recipes.id, input.id),
          with: {
            groceryItems: true,
          },
        });

        if (!recipe) {
          throw new Error("Recipe not found");
        }
        return recipe;
      }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          groceryItems: z
            .array(
              z.object({
                name: z.string(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        const newRecipes = await db
          .insert(recipes)
          .values({
            name: input.name,
          })
          .returning();

        const newRecipe = newRecipes[0];

        // If grocery items are provided, insert them
        if (input.groceryItems && input.groceryItems.length > 0) {
          await db.insert(groceryItems).values(
            input.groceryItems.map((item) => ({
              name: item.name,
              recipeId: newRecipe.id,
            }))
          );
        }

        // Return the recipe with grocery items
        const recipeWithItems = await db.query.recipes.findFirst({
          where: eq(recipes.id, newRecipe.id),
          with: {
            groceryItems: true,
          },
        });

        return recipeWithItems;
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          groceryItems: z
            .array(
              z.object({
                name: z.string(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, groceryItems: newGroceryItems, ...updateData } = input;

        // Update recipe
        const updatedRecipes = await db
          .update(recipes)
          .set(updateData)
          .where(eq(recipes.id, id))
          .returning();

        if (updatedRecipes.length === 0) {
          throw new Error("Recipe not found");
        }

        // If grocery items are provided, update them while preserving checked status
        if (newGroceryItems) {
          // Get existing grocery items for this recipe
          const existingItems = await db
            .select()
            .from(groceryItems)
            .where(eq(groceryItems.recipeId, id));

          // Create a map of existing items by name for quick lookup
          const existingItemsMap = new Map(
            existingItems.map((item) => [item.name, item])
          );

          // Get the names of new items
          const newItemNames = new Set(
            newGroceryItems.map((item) => item.name)
          );

          // Delete items that are no longer in the new list
          const itemsToDelete = existingItems.filter(
            (item) => !newItemNames.has(item.name)
          );
          for (const itemToDelete of itemsToDelete) {
            await db
              .delete(groceryItems)
              .where(eq(groceryItems.id, itemToDelete.id));
          }

          // Insert new items that don't exist yet
          const itemsToInsert = newGroceryItems.filter(
            (item) => !existingItemsMap.has(item.name)
          );
          if (itemsToInsert.length > 0) {
            await db.insert(groceryItems).values(
              itemsToInsert.map((item) => ({
                name: item.name,
                recipeId: id,
              }))
            );
          }
        }

        // Return the updated recipe with grocery items
        const recipeWithItems = await db.query.recipes.findFirst({
          where: eq(recipes.id, id),
          with: {
            groceryItems: true,
          },
        });

        return recipeWithItems;
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // Delete grocery items first (due to foreign key constraint)
        await db
          .delete(groceryItems)
          .where(eq(groceryItems.recipeId, input.id));

        // Delete recipe
        const deletedRecipes = await db
          .delete(recipes)
          .where(eq(recipes.id, input.id))
          .returning();

        if (deletedRecipes.length === 0) {
          throw new Error("Recipe not found");
        }
        return deletedRecipes[0];
      }),
  }),

  meals: createTRPCRouter({
    getAll: publicProcedure.query(async () => {
      const allMeals = await db.query.meals.findMany({
        with: {
          recipe: true,
        },
      });
      return allMeals;
    }),

    getByDateRange: publicProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ input }) => {
        const mealsInRange = await db.query.meals.findMany({
          where: and(
            gte(meals.date, input.startDate),
            lte(meals.date, input.endDate)
          ),
          with: {
            recipe: true,
          },
        });
        return mealsInRange;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const meal = await db.query.meals.findFirst({
          where: eq(meals.id, input.id),
          with: {
            recipe: true,
          },
        });

        if (!meal) {
          throw new Error("Meal not found");
        }
        return meal;
      }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          recipeId: z.number().optional(),
          servings: z.number(),
          date: z.date(),
        })
      )
      .mutation(async ({ input }) => {
        const newMeals = await db
          .insert(meals)
          .values({
            name: input.name,
            recipeId: input.recipeId || null,
            servings: input.servings,
            date: input.date,
          })
          .returning();

        const newMeal = newMeals[0];

        // Return the meal with recipe data
        const mealWithRecipe = await db.query.meals.findFirst({
          where: eq(meals.id, newMeal.id),
          with: {
            recipe: true,
          },
        });

        return mealWithRecipe;
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          recipeId: z.number().optional().nullable(),
          servings: z.number().optional(),
          date: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        const updatedMeals = await db
          .update(meals)
          .set(updateData)
          .where(eq(meals.id, id))
          .returning();

        if (updatedMeals.length === 0) {
          throw new Error("Meal not found");
        }

        // Return the updated meal with recipe data
        const mealWithRecipe = await db.query.meals.findFirst({
          where: eq(meals.id, id),
          with: {
            recipe: true,
          },
        });

        return mealWithRecipe;
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const deletedMeals = await db
          .delete(meals)
          .where(eq(meals.id, input.id))
          .returning();

        if (deletedMeals.length === 0) {
          throw new Error("Meal not found");
        }
        return deletedMeals[0];
      }),
  }),
});

export type AppRouter = typeof appRouter;
