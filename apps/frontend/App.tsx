import React from "react";
import { TamaguiProvider, View, Text, createTamagui } from "@tamagui/core";
import { YStack } from "@tamagui/stacks";
import { defaultConfig } from "@tamagui/config/v4";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./utils/trpc";
import superjson from "superjson";
import { HelloWorld } from "./components/HelloWorld";

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
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config}>
          <YStack
            style={{
              flex: 1,
              background: "$background",
              padding: "$4",
              gap: "$4",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HelloWorld />
          </YStack>
        </TamaguiProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};
