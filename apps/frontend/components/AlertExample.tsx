import React from "react";
import { YStack, Button, Text } from "tamagui";
import { CrossPlatformAlert } from "./CrossPlatformAlert";

export default function AlertExample() {
  const showSimpleAlert = () => {
    CrossPlatformAlert.alert("Hello", "This is a simple alert!");
  };

  const showConfirmAlert = () => {
    CrossPlatformAlert.alert(
      "Confirm Action",
      "Are you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]
    );
  };

  const showDestructiveAlert = () => {
    CrossPlatformAlert.alert("Delete Item", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => console.log("Delete Pressed"),
      },
    ]);
  };

  return (
    <YStack gap="$4" padding="$4">
      <Text fontSize="$6" fontWeight="600">
        CrossPlatformAlert Examples
      </Text>

      <Button onPress={showSimpleAlert}>Show Simple Alert</Button>

      <Button onPress={showConfirmAlert}>Show Confirm Alert</Button>

      <Button onPress={showDestructiveAlert}>Show Destructive Alert</Button>
    </YStack>
  );
}
