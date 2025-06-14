import React from "react";
import { RecipeList } from "../../components/RecipeList";
import { View } from "tamagui";

export default function RecipesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <RecipeList />
    </View>
  );
}
