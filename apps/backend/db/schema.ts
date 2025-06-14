import { pgTable, serial, text, boolean, varchar } from "drizzle-orm/pg-core";

export const groceryLists = pgTable("grocery_lists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  inCart: boolean("in_cart").default(false).notNull(),
});

export type GroceryItem = typeof groceryLists.$inferSelect;
export type NewGroceryItem = typeof groceryLists.$inferInsert;
