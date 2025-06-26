import { NextResponse } from "next/server";
import { db } from "../../../db";
import { groceryItems } from "../../../db/schema";
import { eq } from "drizzle-orm";

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

// GET all grocery items
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If ID is provided, return specific item
    if (id) {
      const items = await db
        .select()
        .from(groceryItems)
        .where(eq(groceryItems.id, parseInt(id)));

      if (items.length === 0) {
        return NextResponse.json(
          { error: "Grocery item not found" },
          { status: 404, headers: corsHeaders }
        );
      }
      return NextResponse.json(items[0], { headers: corsHeaders });
    }

    // Otherwise return all items
    const items = await db.select().from(groceryItems);
    return NextResponse.json(items, { headers: corsHeaders });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST to update a grocery item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, recipeId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update the item
    const updatedItems = await db
      .update(groceryItems)
      .set({
        ...(name && { name }),
        ...(recipeId !== undefined && { recipeId }),
      })
      .where(eq(groceryItems.id, parseInt(id)))
      .returning();

    if (updatedItems.length === 0) {
      return NextResponse.json(
        { error: "Grocery item not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(updatedItems[0], { headers: corsHeaders });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT to create a new grocery item
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, recipeId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const newItems = await db
      .insert(groceryItems)
      .values({
        name,
        recipeId: recipeId || null,
      })
      .returning();

    return NextResponse.json(newItems[0], { headers: corsHeaders });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE to remove a grocery item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const deletedItems = await db
      .delete(groceryItems)
      .where(eq(groceryItems.id, parseInt(id)))
      .returning();

    if (deletedItems.length === 0) {
      return NextResponse.json(
        { error: "Grocery item not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(deletedItems[0], { headers: corsHeaders });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
