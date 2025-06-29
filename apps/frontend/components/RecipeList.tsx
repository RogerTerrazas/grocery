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
  const [searchQuery, setSearchQuery] = useState("");

  const recipesQuery = trpc.recipes.getAll.useQuery();

  // Filter recipes based on search query
  const filteredRecipes =
    recipesQuery.data?.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
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
      {/* Search recipes */}
      <YStack style={{ padding: 16, paddingBottom: 8 }}>
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginBottom: 8 }}
        />
      </YStack>

      {/* Add new recipe form */}
      <YStack style={{ padding: 16, paddingTop: 0, paddingBottom: 8 }}>
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
          <Button
            variant="outlined"
            onPress={() => router.push("/create-recipe")}
          >
            From Text
          </Button>
        </XStack>
      </YStack>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <YStack style={{ padding: 16, paddingTop: 8, gap: 16 }}>
          {filteredRecipes.length === 0 && searchQuery.trim() !== "" ? (
            <Text
              style={{
                textAlign: "center",
                color: theme.color.get(),
                opacity: 0.7,
              }}
            >
              No recipes found matching "{searchQuery}"
            </Text>
          ) : (
            filteredRecipes.map((recipe) => (
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
              </YStack>
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
};
