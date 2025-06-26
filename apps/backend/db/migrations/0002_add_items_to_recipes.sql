-- Only add the items column to recipes table if it doesn't already exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipes' AND column_name = 'items'
    ) THEN
        ALTER TABLE "recipes" ADD COLUMN "items" text[];
    END IF;
END $$;
