import { NextResponse } from "next/server";
import { db } from "../../../db";
import { recipes } from "../../../db/schema";
import { eq } from "drizzle-orm";

interface Recipe {
  id: number;
  name: string;
}

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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If ID is provided, return specific recipe
    if (id) {
      const recipeId = parseInt(id, 10);
      if (isNaN(recipeId)) {
        return NextResponse.json(
          { error: "Invalid recipe ID" },
          { status: 400, headers: corsHeaders }
        );
      }

      const recipeList = await db
        .select()
        .from(recipes)
        .where(eq(recipes.id, recipeId));

      if (recipeList.length === 0) {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404, headers: corsHeaders }
        );
      }
      return NextResponse.json(recipeList[0], { headers: corsHeaders });
    }

    // Otherwise return all recipes
    const allRecipes = await db.select().from(recipes);
    return NextResponse.json(allRecipes, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST - Create a new recipe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400, headers: corsHeaders }
      );
    }

    const newRecipes = await db
      .insert(recipes)
      .values({
        name,
      })
      .returning();

    return NextResponse.json(newRecipes[0], { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
