import { NextResponse } from "next/server";

// Mock recipes data
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

const recipes: Recipe[] = [
  {
    id: "1",
    name: "Spaghetti Bolognese",
    description: "Classic Italian pasta dish with a rich meat sauce.",
    ingredients: [
      { name: "Ground Beef", quantity: 1, unit: "lb" },
      { name: "Onion", quantity: 1, unit: "medium" },
      { name: "Garlic", quantity: 3, unit: "cloves" },
      { name: "Canned Tomatoes", quantity: 28, unit: "oz" },
      { name: "Tomato Paste", quantity: 2, unit: "tbsp" },
      { name: "Spaghetti", quantity: 1, unit: "lb" },
      { name: "Parmesan Cheese", quantity: 0.25, unit: "cup" },
    ],
    instructions: [
      "Brown the ground beef in a large skillet over medium heat.",
      "Add diced onion and garlic, cook until softened.",
      "Stir in canned tomatoes and tomato paste. Simmer for 30 minutes.",
      "Meanwhile, cook spaghetti according to package directions.",
      "Serve sauce over pasta with grated Parmesan cheese.",
    ],
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1622973536968-3ead9e780960",
  },
  {
    id: "2",
    name: "Chicken Stir Fry",
    description: "Quick and healthy stir fry with vegetables and chicken.",
    ingredients: [
      { name: "Chicken Breast", quantity: 1, unit: "lb" },
      { name: "Broccoli", quantity: 2, unit: "cups" },
      { name: "Carrots", quantity: 2, unit: "medium" },
      { name: "Bell Pepper", quantity: 1, unit: "large" },
      { name: "Soy Sauce", quantity: 3, unit: "tbsp" },
      { name: "Garlic", quantity: 2, unit: "cloves" },
      { name: "Ginger", quantity: 1, unit: "tbsp" },
      { name: "Rice", quantity: 2, unit: "cups" },
    ],
    instructions: [
      "Slice chicken into thin strips and marinate in 1 tbsp soy sauce.",
      "Chop all vegetables into bite-sized pieces.",
      "Heat oil in a wok or large skillet over high heat.",
      "Stir fry chicken until cooked through, then remove from pan.",
      "Stir fry vegetables with garlic and ginger until crisp-tender.",
      "Return chicken to pan, add remaining soy sauce, and toss to combine.",
      "Serve over cooked rice.",
    ],
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
  },
  {
    id: "3",
    name: "Vegetable Soup",
    description: "Hearty vegetable soup perfect for cold days.",
    ingredients: [
      { name: "Onion", quantity: 1, unit: "large" },
      { name: "Carrots", quantity: 3, unit: "medium" },
      { name: "Celery", quantity: 2, unit: "stalks" },
      { name: "Potatoes", quantity: 2, unit: "medium" },
      { name: "Vegetable Broth", quantity: 6, unit: "cups" },
      { name: "Diced Tomatoes", quantity: 14, unit: "oz" },
      { name: "Green Beans", quantity: 1, unit: "cup" },
      { name: "Herbs", quantity: 1, unit: "tbsp" },
    ],
    instructions: [
      "Dice all vegetables into bite-sized pieces.",
      "In a large pot, sauté onion, carrots, and celery until softened.",
      "Add potatoes, broth, and tomatoes. Bring to a boil.",
      "Reduce heat and simmer for 15 minutes.",
      "Add green beans and herbs, simmer for another 10 minutes.",
      "Season with salt and pepper to taste.",
    ],
    prepTime: 15,
    cookTime: 30,
    servings: 6,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
  },
];

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET all recipes or a specific recipe by ID
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // If ID is provided, return specific recipe
  if (id) {
    const recipe = recipes.find((recipe) => recipe.id === id);
    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(recipe, { headers: corsHeaders });
  }

  // Otherwise return all recipes
  return NextResponse.json(recipes, { headers: corsHeaders });
}
