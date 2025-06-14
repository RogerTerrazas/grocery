import React from "react";
import { Text, View } from "@tamagui/core";
import { YStack, XStack } from "@tamagui/stacks";
import { trpc } from "../utils/trpc";

export const RecipeList = () => {
  const recipesQuery = trpc.recipes.getAll.useQuery();

  if (recipesQuery.isLoading) {
    return (
      <YStack style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Recipes</Text>
        <Text>Loading recipes...</Text>
      </YStack>
    );
  }

  if (recipesQuery.error) {
    return (
      <YStack style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Recipes</Text>
        <Text style={{ color: "red" }}>
          Error: {recipesQuery.error.message}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack style={{ padding: 16, gap: 16, flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Recipes</Text>

      <YStack style={{ gap: 16, overflow: "auto" }}>
        {recipesQuery.data?.map((recipe) => (
          <YStack
            key={recipe.id}
            style={{
              backgroundColor: "#f9f9f9",
              borderRadius: 8,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {recipe.name}
            </Text>

            <Text style={{ fontSize: 14, color: "#666" }}>
              {recipe.description}
            </Text>

            <XStack style={{ gap: 16, marginTop: 8 }}>
              <Text style={{ fontSize: 14 }}>Prep: {recipe.prepTime} min</Text>
              <Text style={{ fontSize: 14 }}>Cook: {recipe.cookTime} min</Text>
              <Text style={{ fontSize: 14 }}>Servings: {recipe.servings}</Text>
            </XStack>

            <YStack style={{ gap: 8, marginTop: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                Ingredients:
              </Text>
              {recipe.ingredients.map((ingredient, index) => (
                <Text key={index} style={{ fontSize: 14 }}>
                  • {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </Text>
              ))}
            </YStack>

            <YStack style={{ gap: 8, marginTop: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                Instructions:
              </Text>
              {recipe.instructions.map((instruction, index) => (
                <Text key={index} style={{ fontSize: 14 }}>
                  {index + 1}. {instruction}
                </Text>
              ))}
            </YStack>
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
};
