// Simple test script for the recipe processing API
// Run with: node test-recipe-api.js

const testRecipe = `
Chocolate Chip Cookies

Ingredients:
- 2 1/4 cups all-purpose flour
- 1 tsp baking soda
- 1 tsp salt
- 1 cup butter, softened
- 3/4 cup granulated sugar
- 3/4 cup packed brown sugar
- 2 large eggs
- 2 tsp vanilla extract
- 2 cups chocolate chips

Instructions:
1. Preheat oven to 375°F
2. Mix flour, baking soda and salt in bowl
3. Beat butter and sugars until creamy
4. Add eggs and vanilla
5. Gradually blend in flour mixture
6. Stir in chocolate chips
7. Drop onto ungreased cookie sheets
8. Bake 9-11 minutes
`;

async function testRecipeAPI() {
  try {
    console.log("Testing Recipe Processing API...\n");
    console.log("Input recipe text:");
    console.log(testRecipe);
    console.log("\n" + "=".repeat(50) + "\n");

    const response = await fetch("http://localhost:3000/api/process-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipeText: testRecipe,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    console.log("API Response:");
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("\n" + "=".repeat(50));
      console.log("SUCCESS! Recipe processed and saved to database");
      console.log(`Recipe ID: ${result.recipe.id}`);
      console.log(`Recipe Name: ${result.recipe.name}`);
      console.log(
        `Number of grocery items created: ${result.groceryItems.length}`
      );
      console.log("\nGrocery Items:");
      result.groceryItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
      });
    }
  } catch (error) {
    console.error("Error testing API:", error.message);
    console.log("\nMake sure:");
    console.log("1. The development server is running (npm run dev)");
    console.log("2. The OPENAI_API_KEY is set in .env.local");
    console.log("3. The database is properly configured");
  }
}

// Run the test
testRecipeAPI();
