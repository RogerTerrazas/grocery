import {
  pgTable,
  serial,
  text,
  boolean,
  varchar,
  uuid,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const groceryItems = pgTable("grocery_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  recipeId: integer("recipe_id").references(() => recipes.id),
  checked: boolean("checked").default(false).notNull(),
  checkedAt: timestamp("checked_at"),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  recipeId: integer("recipe_id").references(() => recipes.id),
  servings: integer("servings").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations - only if you need to query with recipe data
export const recipesRelations = relations(recipes, ({ many }) => ({
  groceryItems: many(groceryItems),
  meals: many(meals),
}));

export const groceryItemsRelations = relations(groceryItems, ({ one }) => ({
  recipe: one(recipes, {
    fields: [groceryItems.recipeId],
    references: [recipes.id],
  }),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
  recipe: one(recipes, {
    fields: [meals.recipeId],
    references: [recipes.id],
  }),
}));

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;

export type GroceryItem = typeof groceryItems.$inferSelect;
export type NewGroceryItem = typeof groceryItems.$inferInsert;

export type Meal = typeof meals.$inferSelect;
export type NewMeal = typeof meals.$inferInsert;
