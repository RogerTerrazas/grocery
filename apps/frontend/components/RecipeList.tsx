import React, { useState } from "react";
import {
  Text,
  View,
  YStack,
  XStack,
  useTheme,
  ScrollView,
  Button,
  Input,
} from "tamagui";
import { trpc } from "../utils/trpc";
import { useRouter } from "expo-router";

export const RecipeList = () => {
  const theme = useTheme();
  const router = useRouter();
  const [newRecipeName, setNewRecipeName] = useState("");

  const recipesQuery = trpc.recipes.getAll.useQuery();
  const createRecipeMutation = trpc.recipes.create.useMutation({
    onSuccess: () => {
      recipesQuery.refetch();
      setNewRecipeName("");
    },
  });

  const handleCreateRecipe = () => {
    if (newRecipeName.trim()) {
      createRecipeMutation.mutate({ name: newRecipeName.trim() });
    }
  };

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
        <Text>Error: {recipesQuery.error.message}</Text>
      </YStack>
    );
  }

  return (
    <YStack style={{ flex: 1 }}>
      {/* Add new recipe form */}
      <YStack style={{ padding: 16, paddingBottom: 8 }}>
        <XStack style={{ gap: 8, alignItems: "center" }}>
          <Input
            flex={1}
            placeholder="Add new recipe..."
            value={newRecipeName}
            onChangeText={setNewRecipeName}
            onSubmitEditing={handleCreateRecipe}
          />
          <Button
            onPress={handleCreateRecipe}
            disabled={!newRecipeName.trim() || createRecipeMutation.isPending}
          >
            {createRecipeMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </XStack>
      </YStack>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <YStack style={{ padding: 16, paddingTop: 8, gap: 16 }}>
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
              <XStack
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "500", flex: 1 }}>
                  {recipe.name}
                </Text>
                <Button
                  size="$3"
                  onPress={() => router.push(`/recipe/${recipe.id}`)}
                  style={{ marginLeft: 12 }}
                >
                  View/Edit
                </Button>
              </XStack>

              <YStack style={{ gap: 8, marginTop: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "500", opacity: 0.8 }}>
                  Grocery Items:
                </Text>
                {recipe.groceryItems && recipe.groceryItems.length > 0 ? (
                  recipe.groceryItems.map((item) => (
                    <Text
                      key={item.id}
                      style={{ fontSize: 14, lineHeight: 20 }}
                    >
                      • {item.name}
                    </Text>
                  ))
                ) : (
                  <Text style={{ fontSize: 14, lineHeight: 20, opacity: 0.6 }}>
                    No grocery items added yet
                  </Text>
                )}
              </YStack>
            </YStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
};
