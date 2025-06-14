import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "tamagui";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Tabs
        screenOptions={{
          headerShown: false, // ← hide the top header
          tabBarActiveTintColor: theme.color.get(),
          tabBarInactiveTintColor: theme.color.get().replace(/1$/, "6"),
          tabBarStyle: {
            backgroundColor: theme.background.get(),
            borderTopWidth: 1,
            borderTopColor: theme.borderColor.get(),
          },
        }}
      >
        <Tabs.Screen
          name="groceries"
          options={{
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="shopping-cart" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="recipes"
          options={{
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="restaurant-menu" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
}) {
  return <MaterialIcons size={24} style={{ marginBottom: -3 }} {...props} />;
}
