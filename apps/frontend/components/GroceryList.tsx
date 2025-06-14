import React, { useState } from "react";
import { Text, View, XStack, useTheme, YStack, Button, Input } from "tamagui";
import { trpc } from "../utils/trpc";

export const GroceryList = () => {
  const theme = useTheme();
  const [newItemName, setNewItemName] = useState("");

  const groceriesQuery = trpc.groceries.getAll.useQuery();
  const toggleInCartMutation = trpc.groceries.toggleInCart.useMutation({
    onSuccess: () => groceriesQuery.refetch(),
  });
  const createItemMutation = trpc.groceries.create.useMutation({
    onSuccess: () => {
      groceriesQuery.refetch();
      setNewItemName("");
    },
  });

  const handleToggleInCart = (id: number) => {
    toggleInCartMutation.mutate({ id });
  };

  const handleCreateItem = () => {
    if (newItemName.trim()) {
      createItemMutation.mutate({ name: newItemName.trim() });
    }
  };

  if (groceriesQuery.isLoading || groceriesQuery.error) {
    return (
      <YStack style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "500" }}>Grocery List</Text>
        {groceriesQuery.isLoading ? (
          <Text>Loading groceries...</Text>
        ) : (
          <Text style={{ color: "red" }}>
            Error: {groceriesQuery.error?.message}
          </Text>
        )}
      </YStack>
    );
  }

  return (
    <YStack style={{ padding: 8, gap: 8, flex: 1 }}>
      {/* Add new item form */}
      <XStack style={{ gap: 8, alignItems: "center" }}>
        <Input
          flex={1}
          placeholder="Add new grocery item..."
          value={newItemName}
          onChangeText={setNewItemName}
          onSubmitEditing={handleCreateItem}
        />
        <Button
          onPress={handleCreateItem}
          disabled={!newItemName.trim() || createItemMutation.isPending}
        >
          {createItemMutation.isPending ? "Adding..." : "Add"}
        </Button>
      </XStack>

      {/* Grocery items list */}
      <YStack style={{ gap: 8, overflow: "auto", flex: 1 }}>
        {groceriesQuery.data?.map((item) => (
          <XStack
            key={item.id}
            style={{
              padding: 8,
              gap: 8,
              alignItems: "center",
              backgroundColor: theme.background.get(),
              borderRadius: 4,
              borderWidth: 1,
              borderColor: theme.borderColor.get(),
              marginBottom: 2,
            }}
            onPress={() => handleToggleInCart(item.id)}
            pressStyle={{ opacity: 0.7 }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 2,
                borderWidth: 1,
                borderColor: theme.borderColorHover?.get() || "#ccc",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: item.inCart ? "#007bff" : "transparent",
              }}
            >
              {item.inCart && (
                <Text style={{ color: "white", fontSize: 10 }}>✓</Text>
              )}
            </View>

            <Text
              style={{
                fontSize: 13,
                opacity: item.inCart ? 0.6 : 1,
                textDecorationLine: item.inCart ? "line-through" : "none",
                flex: 1,
              }}
            >
              {item.name}
            </Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
};
