import React from "react";
import { GroceryList } from "../../components/GroceryList";
import { View } from "tamagui";

export default function GroceriesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <GroceryList />
    </View>
  );
}
