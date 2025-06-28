import React, { useState } from "react";
import {
  Text,
  View,
  YStack,
  XStack,
  useTheme,
  Button,
  TextArea,
  ScrollView,
} from "tamagui";
import { trpc } from "../utils/trpc";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

export default function CreateRecipeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [recipeText, setRecipeText] = useState("");

  const processRecipeMutation = trpc.recipes.processFromText.useMutation({
    onSuccess: (data) => {
      setRecipeText("");
      router.push("/(tabs)/recipes");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleCreateRecipe = () => {
    if (!recipeText.trim()) {
      Alert.alert("Error", "Please enter some recipe text");
      return;
    }

    processRecipeMutation.mutate({ recipeText: recipeText.trim() });
  };

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <YStack style={{ flex: 1, padding: 16, gap: 16 }}>
        {/* Header */}
        <XStack
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ fontSize: 24, fontWeight: "600" }}>
            Create Recipe from Text
          </Text>
          <Button size="$3" variant="outlined" onPress={() => router.back()}>
            Cancel
          </Button>
        </XStack>

        {/* Instructions */}
        <YStack
          style={{
            backgroundColor: theme.background.get(),
            borderWidth: 1,
            borderColor: theme.borderColor.get(),
            borderRadius: 8,
            padding: 16,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500" }}>How to use:</Text>
          <Text style={{ fontSize: 14, lineHeight: 20, opacity: 0.8 }}>
            • Paste or type any recipe text below
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, opacity: 0.8 }}>
            • It can be from a website, cookbook, or your own notes
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, opacity: 0.8 }}>
            • AI will extract the recipe name and ingredients automatically
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, opacity: 0.8 }}>
            • The ingredients will be added to your grocery list
          </Text>
        </YStack>

        {/* Recipe Text Input */}
        <YStack style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "500" }}>Recipe Text:</Text>
          <TextArea
            placeholder="Paste your recipe here... 

For example:
Chocolate Chip Cookies

Ingredients:
- 2 1/4 cups all-purpose flour
- 1 tsp baking soda
- 1 tsp salt
- 1 cup butter, softened
- 3/4 cup granulated sugar
- 3/4 cup brown sugar
- 2 large eggs
- 2 tsp vanilla extract
- 2 cups chocolate chips

Instructions:
1. Preheat oven to 375°F...
"
            value={recipeText}
            onChangeText={setRecipeText}
            style={{
              minHeight: 300,
              backgroundColor: theme.background.get(),
              borderWidth: 1,
              borderColor: theme.borderColor.get(),
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
              lineHeight: 20,
            }}
            multiline
          />
        </YStack>

        {/* Action Buttons */}
        <XStack style={{ gap: 12, marginTop: 8 }}>
          <Button
            flex={1}
            onPress={handleCreateRecipe}
            disabled={!recipeText.trim() || processRecipeMutation.isPending}
            style={{
              backgroundColor: theme.blue9.get(),
            }}
          >
            {processRecipeMutation.isPending
              ? "Processing..."
              : "Create Recipe"}
          </Button>
        </XStack>

        {/* Processing Status */}
        {processRecipeMutation.isPending && (
          <YStack
            style={{
              backgroundColor: theme.blue2.get(),
              borderWidth: 1,
              borderColor: theme.blue6.get(),
              borderRadius: 8,
              padding: 16,
              gap: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: theme.blue11.get(),
              }}
            >
              Processing your recipe...
            </Text>
            <Text
              style={{ fontSize: 12, opacity: 0.8, color: theme.blue11.get() }}
            >
              AI is analyzing the text and extracting ingredients. This may take
              a few seconds.
            </Text>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}
