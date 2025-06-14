import React from "react";
import { Text, View } from "@tamagui/core";
import { YStack, XStack } from "@tamagui/stacks";
import { trpc } from "../utils/trpc";

export const GroceryList = () => {
  const groceriesQuery = trpc.groceries.getAll.useQuery();
  const toggleInCartMutation = trpc.groceries.toggleInCart.useMutation({
    onSuccess: () => {
      // Refetch groceries after toggling
      groceriesQuery.refetch();
    },
  });

  // Group groceries by category
  const groupedGroceries = React.useMemo(() => {
    if (!groceriesQuery.data) return {};

    return groceriesQuery.data.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof groceriesQuery.data>);
  }, [groceriesQuery.data]);

  const handleToggleInCart = (id: string) => {
    toggleInCartMutation.mutate({ id });
  };

  if (groceriesQuery.isLoading) {
    return (
      <YStack style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Grocery List</Text>
        <Text>Loading groceries...</Text>
      </YStack>
    );
  }

  if (groceriesQuery.error) {
    return (
      <YStack style={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Grocery List</Text>
        <Text style={{ color: "red" }}>
          Error: {groceriesQuery.error.message}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack style={{ padding: 16, gap: 16, flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Grocery List</Text>

      <YStack style={{ gap: 16, overflow: "auto" }}>
        {Object.entries(groupedGroceries).map(([category, items]) => (
          <YStack key={category} style={{ gap: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "blue" }}>
              {category}
            </Text>

            {items.map((item) => (
              <YStack
                key={item.id}
                style={{
                  marginBottom: 8,
                }}
              >
                <XStack
                  style={{
                    padding: 12,
                    gap: 12,
                    alignItems: "center",
                    backgroundColor: item.inCart ? "#e6f7e6" : "#f5f5f5",
                    borderRadius: 8,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: item.inCart ? "#4caf50" : "#e0e0e0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.inCart && (
                      <Text style={{ color: "white", fontSize: 14 }}>✓</Text>
                    )}
                  </View>

                  <YStack style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        textDecoration: item.inCart ? "line-through" : "none",
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: "#666" }}>
                      {item.quantity} {item.unit}
                    </Text>
                  </YStack>

                  {item.inCart && (
                    <Text style={{ color: "#4caf50", fontSize: 18 }}>🛒</Text>
                  )}
                </XStack>

                <Text
                  style={{
                    padding: 4,
                    fontSize: 14,
                    color: "#4caf50",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                  onPress={() => handleToggleInCart(item.id)}
                >
                  {item.inCart ? "Mark as Not in Cart" : "Add to Cart"}
                </Text>
              </YStack>
            ))}
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
};
