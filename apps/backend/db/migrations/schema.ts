import { pgTable, serial, varchar, boolean, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const groceryLists = pgTable("grocery_lists", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	inCart: boolean("in_cart").default(false).notNull(),
});

export const recipes = pgTable("recipes", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	ingredients: text().array().notNull(),
});
