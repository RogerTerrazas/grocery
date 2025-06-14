import React, { useState } from "react";
import { TamaguiProvider, View, Text, createTamagui } from "@tamagui/core";
import { YStack, XStack } from "@tamagui/stacks";
import { defaultConfig } from "@tamagui/config/v4";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./utils/trpc";
import superjson from "superjson";
import { GroceryList } from "./components/GroceryList";
import { RecipeList } from "./components/RecipeList";

// you usually export this from a tamagui.config.ts file
const config = createTamagui(defaultConfig);

type Conf = typeof config;

// make imports typed
declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends Conf {}
}

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "http://192.168.1.90:3000/api/trpc",
      transformer: superjson,
      // Add headers for CORS
      headers: {
        "Content-Type": "application/json",
      },
    }),
  ],
});

export default () => {
  const [activeTab, setActiveTab] = useState<"groceries" | "recipes">(
    "groceries"
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config}>
          <YStack
            style={{
              flex: 1,
              background: "#ffffff",
            }}
          >
            {/* Tab Navigation */}
            <XStack
              style={{
                backgroundColor: "#f0f0f0",
                padding: 8,
                justifyContent: "space-around",
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
            >
              <View
                style={{
                  backgroundColor:
                    activeTab === "groceries" ? "#4caf50" : "transparent",
                  padding: 8,
                  borderRadius: 4,
                  flex: 1,
                  marginHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    color: activeTab === "groceries" ? "white" : "#333",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                  onPress={() => setActiveTab("groceries")}
                >
                  Grocery List
                </Text>
              </View>

              <View
                style={{
                  backgroundColor:
                    activeTab === "recipes" ? "#4caf50" : "transparent",
                  padding: 8,
                  borderRadius: 4,
                  flex: 1,
                  marginHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    color: activeTab === "recipes" ? "white" : "#333",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                  onPress={() => setActiveTab("recipes")}
                >
                  Recipes
                </Text>
              </View>
            </XStack>

            {/* Content Area */}
            <YStack style={{ flex: 1 }}>
              {activeTab === "groceries" ? <GroceryList /> : <RecipeList />}
            </YStack>
          </YStack>
        </TamaguiProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
