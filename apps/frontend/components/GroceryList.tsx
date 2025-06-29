import React, { useState } from "react";
import {
  Text,
  View,
  XStack,
  useTheme,
  YStack,
  Button,
  Input,
  Checkbox,
} from "tamagui";
import { trpc } from "../utils/trpc";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { CrossPlatformAlert } from "./CrossPlatformAlert";

export const GroceryList = () => {
  const theme = useTheme();
  const router = useRouter();
  const [newItemName, setNewItemName] = useState("");

  const groceriesQuery = trpc.groceries.getFormatted.useQuery();
  const createItemMutation = trpc.groceries.create.useMutation({
    onSuccess: () => {
      groceriesQuery.refetch();
      setNewItemName("");
    },
  });
  const deleteItemMutation = trpc.groceries.delete.useMutation({
    onSuccess: () => groceriesQuery.refetch(),
  });
  const toggleCheckedMutation = trpc.groceries.toggleChecked.useMutation({
    onSuccess: () => groceriesQuery.refetch(),
  });

  // Refresh grocery list when the screen comes into focus (back navigation)
  useFocusEffect(
    useCallback(() => {
      groceriesQuery.refetch();
    }, [])
  );

  const handleCreateItem = () => {
    if (newItemName.trim()) {
      createItemMutation.mutate({ name: newItemName.trim() });
    }
  };

  const handleDeleteItem = (id: number, itemName: string) => {
    CrossPlatformAlert.alert(
      "Delete Item",
      `Are you sure you want to delete "${itemName}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteItemMutation.mutate({ id });
          },
        },
      ]
    );
  };

  const handleToggleChecked = (id: number) => {
    toggleCheckedMutation.mutate({ id });
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

  // Get the formatted data from the new endpoint
  const formattedData = groceriesQuery.data;
  const checkedItems = formattedData?.checked || [];
  const uncheckedCategories = formattedData?.unchecked || {};

  const renderGroceryItem = (item: any) => (
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
        opacity: item.checked ? 0.6 : 1,
      }}
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={() => handleToggleChecked(item.id)}
        disabled={toggleCheckedMutation.isPending}
        backgroundColor={item.checked ? theme.blue10.get() : "transparent"}
        borderColor={
          item.checked ? theme.blue10.get() : theme.borderColor.get()
        }
      />

      <Text
        style={{
          fontSize: 13,
          flex: 1,
          textDecorationLine: item.checked ? "line-through" : "none",
        }}
      >
        {item.name}
      </Text>

      {item.recipe && (
        <Text
          style={{
            fontSize: 11,
            opacity: 0.7,
            fontStyle: "italic",
            color: theme.blue10.get(),
            textDecorationLine: "underline",
          }}
          onPress={() => router.push(`/recipe/${item.recipe.id}`)}
        >
          {item.recipe.name}
        </Text>
      )}

      {item.checked && item.checkedAt && (
        <Text
          style={{
            fontSize: 10,
            opacity: 0.5,
            fontStyle: "italic",
          }}
        >
          ✓ {new Date(item.checkedAt).toLocaleDateString()}
        </Text>
      )}

      {!item.recipe && (
        <Button
          size="$2"
          variant="outlined"
          onPress={() => handleDeleteItem(item.id, item.name)}
          disabled={deleteItemMutation.isPending}
        >
          {deleteItemMutation.isPending ? "..." : "×"}
        </Button>
      )}
    </XStack>
  );

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
        {/* Unchecked items section - organized by categories */}
        {Object.keys(uncheckedCategories).length > 0 && (
          <YStack style={{ gap: 16 }}>
            {Object.entries(uncheckedCategories).map(([category, items]) => (
              <YStack key={category} style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#556B2F",
                    paddingBottom: 4,
                  }}
                >
                  {category}
                </Text>
                {(items as any[]).map(renderGroceryItem)}
              </YStack>
            ))}
          </YStack>
        )}

        {/* Checked items section - sorted by most recently checked */}
        {checkedItems.length > 0 && (
          <YStack style={{ gap: 8, marginTop: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                opacity: 0.7,
                paddingBottom: 8,
              }}
            >
              Recently Completed
            </Text>
            {checkedItems.map(renderGroceryItem)}
          </YStack>
        )}
      </YStack>
    </YStack>
  );
};
