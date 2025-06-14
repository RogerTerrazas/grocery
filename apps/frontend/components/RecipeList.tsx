import React from "react";
import { Text, View, YStack, XStack, useTheme } from "tamagui";
import { trpc } from "../utils/trpc";

export const RecipeList = () => {
  const theme = useTheme();
  const recipesQuery = trpc.recipes.getAll.useQuery();

  if (recipesQuery.isLoading) {
    return (
      <YStack style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "500" }}>Recipes</Text>
        <Text>Loading recipes...</Text>
      </YStack>
    );
  }

  if (recipesQuery.error) {
    return (
      <YStack style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "500" }}>Recipes</Text>
        <Text>Error: {recipesQuery.error.message}</Text>
      </YStack>
    );
  }

  return (
    <YStack style={{ padding: 16, gap: 16, flex: 1 }}>
      <YStack style={{ gap: 16, overflow: "auto", flex: 1 }}>
        {recipesQuery.data?.map((recipe) => (
          <YStack
            key={recipe.id}
            style={{
              backgroundColor: theme.background.get(),
              borderWidth: 1,
              borderColor: theme.borderColor.get(),
              borderRadius: 4,
              padding: 16,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "500" }}>
              {recipe.name}
            </Text>

            <Text style={{ fontSize: 14, color: "#707070", lineHeight: 20 }}>
              {recipe.description}
            </Text>

            <XStack style={{ gap: 16, marginTop: 4 }}>
              <Text style={{ fontSize: 14, color: "#707070" }}>
                Prep: {recipe.prepTime} min
              </Text>
              <Text style={{ fontSize: 14, color: "#707070" }}>
                Cook: {recipe.cookTime} min
              </Text>
              <Text style={{ fontSize: 14, color: "#707070" }}>
                Servings: {recipe.servings}
              </Text>
            </XStack>

            <YStack style={{ gap: 8, marginTop: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "500", opacity: 0.8 }}>
                Ingredients:
              </Text>
              {recipe.ingredients.map((ingredient, index) => (
                <Text key={index} style={{ fontSize: 14, lineHeight: 20 }}>
                  • {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </Text>
              ))}
            </YStack>

            <YStack style={{ gap: 8, marginTop: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "500", opacity: 0.8 }}>
                Instructions:
              </Text>
              {recipe.instructions.map((instruction, index) => (
                <Text
                  key={index}
                  style={{ fontSize: 14, lineHeight: 20, marginBottom: 4 }}
                >
                  <Text style={{ fontWeight: "500" }}>{index + 1}.</Text>{" "}
                  {instruction}
                </Text>
              ))}
            </YStack>
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
};
