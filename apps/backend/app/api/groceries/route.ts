import { NextResponse } from "next/server";

// Mock grocery list data
interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  inCart: boolean;
}

const groceryItems: GroceryItem[] = [
  {
    id: "1",
    name: "Milk",
    category: "Dairy",
    quantity: 1,
    unit: "gallon",
    inCart: false,
  },
  {
    id: "2",
    name: "Eggs",
    category: "Dairy",
    quantity: 12,
    unit: "count",
    inCart: true,
  },
  {
    id: "3",
    name: "Bread",
    category: "Bakery",
    quantity: 1,
    unit: "loaf",
    inCart: false,
  },
  {
    id: "4",
    name: "Apples",
    category: "Produce",
    quantity: 5,
    unit: "count",
    inCart: false,
  },
  {
    id: "5",
    name: "Chicken Breast",
    category: "Meat",
    quantity: 2,
    unit: "lbs",
    inCart: true,
  },
  {
    id: "6",
    name: "Pasta",
    category: "Dry Goods",
    quantity: 1,
    unit: "box",
    inCart: false,
  },
  {
    id: "7",
    name: "Tomatoes",
    category: "Produce",
    quantity: 4,
    unit: "count",
    inCart: false,
  },
  {
    id: "8",
    name: "Cheese",
    category: "Dairy",
    quantity: 1,
    unit: "block",
    inCart: true,
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

// GET all grocery items
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // If ID is provided, return specific item
  if (id) {
    const item = groceryItems.find((item) => item.id === id);
    if (!item) {
      return NextResponse.json(
        { error: "Grocery item not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(item, { headers: corsHeaders });
  }

  // Otherwise return all items
  return NextResponse.json(groceryItems, { headers: corsHeaders });
}

// POST to toggle inCart status
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const item = groceryItems.find((item) => item.id === id);
    if (!item) {
      return NextResponse.json(
        { error: "Grocery item not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Toggle the inCart status
    item.inCart = !item.inCart;

    return NextResponse.json(item, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: corsHeaders }
    );
  }
}
