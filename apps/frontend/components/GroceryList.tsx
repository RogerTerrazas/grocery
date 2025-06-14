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
    <YStack style={{ padding: 16, gap: 16, flex: 1 }}>
      <YStack style={{ gap: 16, overflow: "auto", flex: 1 }}>
        {Object.entries(groupedGroceries).map(([category, items]) => (
          <YStack key={category} style={{ gap: 8 }}>
            <Text style={{ fontSize: 16, opacity: 0.7 }}>{category}</Text>

            {items.map((item) => (
              <YStack key={item.id} style={{ marginBottom: 8 }}>
                <XStack
                  style={{
                    padding: 12,
                    gap: 12,
                    alignItems: "center",
                    backgroundColor: theme.background.get(),
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: theme.borderColor.get(),
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 2,
                      borderWidth: 1,
                      borderColor: theme.borderColorHover?.get() || "#ccc",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: item.inCart ? "#007bff" : "transparent",
                    }}
                  >
                    {item.inCart && <Text style={{ color: "white" }}>✓</Text>}
                  </View>

                  <YStack style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        opacity: item.inCart ? 0.6 : 1,
                        textDecorationLine: item.inCart
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#707070" }}>
                      {item.quantity} {item.unit}
                    </Text>
                  </YStack>
                </XStack>

                <Button
                  size="$2"
                  variant="outlined"
                  style={{ marginTop: 8 }}
                  onPress={() => handleToggleInCart(item.id)}
                >
                  <Text style={{ fontSize: 12, color: "#707070" }}>
                    {item.inCart ? "Mark as Not in Cart" : "Add to Cart"}
                  </Text>
                </Button>
              </YStack>
            ))}
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
};
