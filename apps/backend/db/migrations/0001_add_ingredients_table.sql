-- Create ingredients table
CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"quantity" varchar(100),
	"unit" varchar(50),
	"recipe_id" integer
);

-- Add foreign key constraint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Migrate existing data from recipes.ingredients array to ingredients table
DO $$
DECLARE
    recipe_record RECORD;
    ingredient_text TEXT;
BEGIN
    -- Loop through all recipes that have ingredients
    FOR recipe_record IN 
        SELECT id, ingredients 
        FROM recipes 
        WHERE ingredients IS NOT NULL AND array_length(ingredients, 1) > 0
    LOOP
        -- Loop through each ingredient in the array
        FOREACH ingredient_text IN ARRAY recipe_record.ingredients
        LOOP
            -- Insert each ingredient as a separate row
            INSERT INTO ingredients (name, recipe_id)
            VALUES (ingredient_text, recipe_record.id);
        END LOOP;
    END LOOP;
END $$;

-- Remove the ingredients column from recipes table
ALTER TABLE "recipes" DROP COLUMN "ingredients";
