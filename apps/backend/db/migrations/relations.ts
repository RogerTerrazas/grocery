import { relations } from "drizzle-orm/relations";
import { recipes, groceryItems, meals } from "./schema";

export const groceryItemsRelations = relations(groceryItems, ({one}) => ({
	recipe: one(recipes, {
		fields: [groceryItems.recipeId],
		references: [recipes.id]
	}),
}));

export const recipesRelations = relations(recipes, ({many}) => ({
	groceryItems: many(groceryItems),
	meals: many(meals),
}));

export const mealsRelations = relations(meals, ({one}) => ({
	recipe: one(recipes, {
		fields: [meals.recipeId],
		references: [recipes.id]
	}),
}));