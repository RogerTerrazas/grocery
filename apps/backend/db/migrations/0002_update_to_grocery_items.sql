-- Drop the old tables
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS grocery_lists;

-- Create the new grocery_items table
CREATE TABLE grocery_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  recipe_id INTEGER REFERENCES recipes(id)
);
