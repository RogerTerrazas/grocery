import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useTheme, YStack, XStack, Button, Input, Text } from "tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { trpc } from "../utils/trpc";
import { CrossPlatformAlert } from "../components/CrossPlatformAlert";

export default function EditMealScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const mealId = parseInt(params.id as string);

  // Form states
  const [searchInput, setSearchInput] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [servings, setServings] = useState("1");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch meal data
  const mealQuery = trpc.meals.getById.useQuery({ id: mealId });

  // Fetch all recipes for searching
  const recipesQuery = trpc.recipes.getAll.useQuery();

  // Filter recipes based on search input
  const filteredRecipes = useMemo(() => {
    if (!recipesQuery.data || !searchInput.trim()) return [];

    return recipesQuery.data.filter((recipe) =>
      recipe.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [recipesQuery.data, searchInput]);

  // Populate form when meal data loads
  useEffect(() => {
    if (mealQuery.data) {
      setSearchInput(mealQuery.data.name);
      setServings(mealQuery.data.servings.toString());

      // If the meal has a recipe, set it as selected
      if (mealQuery.data.recipeId && recipesQuery.data) {
        const recipe = recipesQuery.data.find(
          (r) => r.id === mealQuery.data.recipeId
        );
        if (recipe) {
          setSelectedRecipe({ id: recipe.id, name: recipe.name });
        }
      }
    }
  }, [mealQuery.data, recipesQuery.data]);

  // tRPC mutations
  const updateMealMutation = trpc.meals.update.useMutation({
    onSuccess: () => {
      router.back();
    },
    onError: (error) => {
      CrossPlatformAlert.alert(
        "Error",
        `Failed to update meal: ${error.message}`
      );
    },
  });

  const deleteMealMutation = trpc.meals.delete.useMutation({
    onSuccess: () => {
      router.back();
    },
    onError: (error) => {
      CrossPlatformAlert.alert(
        "Error",
        `Failed to delete meal: ${error.message}`
      );
    },
  });

  const handleSave = () => {
    if (!searchInput.trim()) {
      CrossPlatformAlert.alert(
        "Error",
        "Please enter a meal name or search for a recipe"
      );
      return;
    }

    // Use the selected recipe name if one is selected, otherwise use the search input as meal name
    const mealName = selectedRecipe ? selectedRecipe.name : searchInput.trim();
    const recipeId = selectedRecipe ? selectedRecipe.id : null;

    updateMealMutation.mutate({
      id: mealId,
      name: mealName,
      recipeId: recipeId,
      servings: parseInt(servings) || 1,
    });
  };

  const handleInputChange = (text: string) => {
    setSearchInput(text);
    setSelectedRecipe(null);
    setShowSuggestions(text.trim().length > 0);
  };

  const handleRecipeSelect = (recipe: { id: number; name: string }) => {
    setSelectedRecipe(recipe);
    setSearchInput(recipe.name);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (searchInput.trim().length > 0 && !selectedRecipe) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for recipe selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleDelete = () => {
    if (!mealQuery.data) return;

    CrossPlatformAlert.alert(
      "Delete Meal",
      `Are you sure you want to delete "${mealQuery.data.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMealMutation.mutate({ id: mealId }),
        },
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.get(),
    },
    header: {
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor.get(),
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.color.get(),
      textAlign: "center",
    },
    content: {
      flex: 1,
      padding: 16,
    },
    dateInfo: {
      backgroundColor: theme.blue2.get(),
      padding: 12,
      borderRadius: 8,
      marginBottom: 24,
    },
    dateText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.blue11.get(),
      textAlign: "center",
    },
  });

  if (mealQuery.isLoading || recipesQuery.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Meal</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.color.get() }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (mealQuery.error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Meal</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.color.get() }}>
            Error loading meal: {mealQuery.error.message}
          </Text>
        </View>
      </View>
    );
  }

  if (recipesQuery.error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Meal</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.color.get() }}>
            Error loading recipes: {recipesQuery.error.message}
          </Text>
        </View>
      </View>
    );
  }

  if (!mealQuery.data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Meal</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.color.get() }}>Meal not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <XStack
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Button size="$3" variant="outlined" onPress={handleCancel}>
            <MaterialIcons
              name="arrow-back"
              size={18}
              color={theme.color.get()}
            />
          </Button>
          <Text style={styles.headerTitle}>Edit Meal</Text>
          <View style={{ width: 60 }} />
        </XStack>
      </View>

      <View style={styles.content}>
        <YStack style={{ gap: 24 }}>
          {/* Date Info */}
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>
              {mealQuery.data.date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          {/* Form */}
          <YStack style={{ gap: 16 }}>
            <YStack style={{ gap: 8, position: "relative" }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: theme.color.get(),
                }}
              >
                Meal Name / Recipe Search *
              </Text>
              <Input
                placeholder="Search for a recipe or enter meal name..."
                value={searchInput}
                onChangeText={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                style={{
                  backgroundColor: theme.background.get(),
                  borderWidth: 1,
                  borderColor: theme.borderColor.get(),
                }}
              />

              {/* Recipe Suggestions */}
              {showSuggestions && filteredRecipes.length > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: 70,
                    left: 0,
                    right: 0,
                    backgroundColor: theme.background.get(),
                    borderWidth: 1,
                    borderColor: theme.borderColor.get(),
                    borderRadius: 8,
                    maxHeight: 200,
                    zIndex: 1000,
                  }}
                >
                  <FlatList
                    data={filteredRecipes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleRecipeSelect(item)}
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.borderColor.get(),
                        }}
                      >
                        <Text style={{ color: theme.color.get() }}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                    style={{ maxHeight: 200 }}
                  />
                </View>
              )}

              {/* Selected Recipe Indicator */}
              {selectedRecipe && (
                <XStack
                  style={{
                    alignItems: "center",
                    gap: 8,
                    padding: 8,
                    backgroundColor: theme.green2.get(),
                    borderRadius: 6,
                  }}
                >
                  <MaterialIcons
                    name="restaurant"
                    size={16}
                    color={theme.green11.get()}
                  />
                  <Text
                    style={{
                      color: theme.green11.get(),
                      fontSize: 14,
                      flex: 1,
                    }}
                  >
                    Recipe selected: {selectedRecipe.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push(`/recipe/${selectedRecipe.id}`)}
                    style={{
                      backgroundColor: theme.green9.get(),
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      View Recipe
                    </Text>
                  </TouchableOpacity>
                </XStack>
              )}
            </YStack>

            <YStack style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: theme.color.get(),
                }}
              >
                Servings
              </Text>
              <Input
                placeholder="1"
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
                style={{
                  backgroundColor: theme.background.get(),
                  borderWidth: 1,
                  borderColor: theme.borderColor.get(),
                }}
              />
            </YStack>
          </YStack>

          {/* Actions */}
          <XStack style={{ gap: 12, marginTop: "auto", paddingBottom: 20 }}>
            <Button
              variant="outlined"
              onPress={handleDelete}
              disabled={deleteMealMutation.isPending}
              style={{
                borderColor: theme.red8.get(),
              }}
            >
              <Text style={{ color: theme.red11.get() }}>
                {deleteMealMutation.isPending ? "Deleting..." : "Delete"}
              </Text>
            </Button>
            <Button flex={1} variant="outlined" onPress={handleCancel}>
              Cancel
            </Button>
            <Button
              flex={1}
              onPress={handleSave}
              disabled={!searchInput.trim() || updateMealMutation.isPending}
              style={{
                backgroundColor: theme.blue9.get(),
              }}
            >
              {updateMealMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </XStack>
        </YStack>
      </View>
    </View>
  );
}
