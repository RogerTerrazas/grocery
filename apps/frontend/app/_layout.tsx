import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { TamaguiProvider, useTheme } from "tamagui";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import { tamaguiConfig } from "../tamagui.config";
import { trpc } from "../utils/trpc";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { QueryClient } from "@tanstack/react-query";

export default function RootLayout() {
  const queryClient = new QueryClient();
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme === "dark" ? "dark" : "light");

  // Update theme when system theme changes
  useEffect(() => {
    setTheme(colorScheme === "dark" ? "dark" : "light");
  }, [colorScheme]);

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

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </TamaguiProvider>
    </trpc.Provider>
  );
}
