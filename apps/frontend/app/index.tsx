import React from "react";
import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to the groceries tab
  return <Redirect href="/(tabs)/groceries" />;
}
