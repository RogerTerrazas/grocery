import { createTRPCRouter, publicProcedure } from "./trpc";
import { z } from "zod";
import { db } from "../../db";
import { groceryLists } from "../../db/schema";
import { eq } from "drizzle-orm";

// Define types for our API responses - updated to match new schema
interface GroceryItem {
  id: number;
  name: string;
  inCart: boolean;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  imageUrl: string;
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
      const items = await db.select().from(groceryLists);
      return items;
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const items = await db
          .select()
          .from(groceryLists)
          .where(eq(groceryLists.id, input.id));

        if (items.length === 0) {
          throw new Error("Grocery item not found");
        }
        return items[0];
      }),

    toggleInCart: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        // First, get the current item
        const items = await db
          .select()
          .from(groceryLists)
          .where(eq(groceryLists.id, input.id));

        if (items.length === 0) {
          throw new Error("Grocery item not found");
        }

        const currentItem = items[0];

        // Toggle the inCart status
        const updatedItems = await db
          .update(groceryLists)
          .set({ inCart: !currentItem.inCart })
          .where(eq(groceryLists.id, input.id))
          .returning();

        return updatedItems[0];
      }),

    create: publicProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ input }) => {
        const newItems = await db
          .insert(groceryLists)
          .values({ name: input.name, inCart: false })
          .returning();

        return newItems[0];
      }),
  }),

  recipes: createTRPCRouter({
    getAll: publicProcedure.query(async () => {
      // Call the NextJS API route
      const response = await fetch("http://localhost:3000/api/recipes");
      const data = await response.json();
      return data as Recipe[];
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        // Call the NextJS API route with ID parameter
        const response = await fetch(
          `http://localhost:3000/api/recipes?id=${input.id}`
        );
        const data = await response.json();
        return data as Recipe;
      }),
  }),
});

export type AppRouter = typeof appRouter;
