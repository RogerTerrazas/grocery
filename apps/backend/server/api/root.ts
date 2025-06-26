import { createTRPCRouter, publicProcedure } from "./trpc";
import { z } from "zod";
import { db } from "../../db";
import { groceryItems, recipes } from "../../db/schema";
import { eq } from "drizzle-orm";

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
});

export type AppRouter = typeof appRouter;
