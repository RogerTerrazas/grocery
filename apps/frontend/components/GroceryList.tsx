import React from "react";
import { Text, View, XStack, useTheme, YStack, Button } from "tamagui";
import { trpc } from "../utils/trpc";

export const GroceryList = () => {
  const theme = useTheme();
  const groceriesQuery = trpc.groceries.getAll.useQuery();
  const toggleInCartMutation = trpc.groceries.toggleInCart.useMutation({
    onSuccess: () => groceriesQuery.refetch(),
  });

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
      <YStack style={{ gap: 8, overflow: "auto", flex: 1 }}>
        {Object.entries(groupedGroceries).map(([category, items]) => (
          <YStack key={category} style={{ gap: 4 }}>
            <Text style={{ fontSize: 14, opacity: 0.7, fontWeight: "600" }}>
              {category}
            </Text>

            {items.map((item) => (
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

                <YStack style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      opacity: item.inCart ? 0.6 : 1,
                      textDecorationLine: item.inCart ? "line-through" : "none",
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#707070" }}>
                    {item.quantity} {item.unit}
                  </Text>
                </YStack>
              </XStack>
            ))}
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
};
