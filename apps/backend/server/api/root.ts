import { createTRPCRouter, publicProcedure } from './trpc';
import { z } from 'zod';

export const appRouter = createTRPCRouter({
  hello: createTRPCRouter({
    greeting: publicProcedure
      .input(z.object({ name: z.string().optional() }))
      .query(({ input }) => {
        return {
          greeting: `Hello ${input.name ?? 'world'}!`,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter; 