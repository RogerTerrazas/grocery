import { createTRPCRouter, publicProcedure } from "./trpc";
import { z } from "zod";

// Define types for our API responses
interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
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
      // Call the NextJS API route
      const response = await fetch("http://localhost:3000/api/groceries");
      const data = await response.json();
      return data as GroceryItem[];
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        // Call the NextJS API route with ID parameter
        const response = await fetch(
          `http://localhost:3000/api/groceries?id=${input.id}`
        );
        const data = await response.json();
        return data as GroceryItem;
      }),

    toggleInCart: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        // Call the NextJS API route to toggle inCart status
        const response = await fetch("http://localhost:3000/api/groceries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: input.id }),
        });
        const data = await response.json();
        return data as GroceryItem;
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
