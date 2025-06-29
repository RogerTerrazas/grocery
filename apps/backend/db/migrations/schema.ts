import { pgTable, serial, varchar, foreignKey, integer, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const recipes = pgTable("recipes", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
});

export const groceryItems = pgTable("grocery_items", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	recipeId: integer("recipe_id"),
	checked: boolean().default(false).notNull(),
	checkedAt: timestamp("checked_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "grocery_items_recipe_id_recipes_id_fk"
		}),
]);

export const meals = pgTable("meals", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	recipeId: integer("recipe_id"),
	servings: integer().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "meals_recipe_id_recipes_id_fk"
		}),
]);
