import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { trpc } from "../../utils/trpc";
import { CrossPlatformAlert } from "../../components/CrossPlatformAlert";

interface MealWithRecipe {
  id: number;
  name: string;
  servings: number;
  date: Date;
  recipeId: number | null;
  createdAt: Date;
  recipe?: {
    id: number;
    name: string;
  } | null;
}

export default function PlanningScreen() {
  const theme = useTheme();

  // Get current date and calculate date range from yesterday to a week from now
  const { today, startDate, endDate, weekDays } = React.useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 1); // Start from yesterday

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7); // End a week from now

    // Generate array of 9 days (yesterday + today + 7 days ahead)
    const weekDays = Array.from({ length: 9 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });

    return { today, startDate, endDate, weekDays };
  }, []);

  // Fetch meals for the date range (yesterday to a week from now)
  const mealsQuery = trpc.meals.getByDateRange.useQuery({
    startDate: startDate,
    endDate: endDate,
  });

  // Refetch meals when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      mealsQuery.refetch();
    }, [mealsQuery.refetch])
  );

  // Group meals by date
  const mealsByDate = React.useMemo(() => {
    return (
      mealsQuery.data?.reduce((acc, meal) => {
        const dateKey = meal.date.toDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(meal);
        return acc;
      }, {} as Record<string, MealWithRecipe[]>) || {}
    );
  }, [mealsQuery.data]);

  const handleAddMeal = (date: Date) => {
    router.push({
      pathname: "/add-meal",
      params: { date: date.toISOString() },
    });
  };

  const handleEditMeal = (meal: MealWithRecipe) => {
    router.push({
      pathname: "/edit-meal",
      params: { id: meal.id.toString() },
    });
  };

  // tRPC mutation for delete (only used here)
  const deleteMealMutation = trpc.meals.delete.useMutation({
    onSuccess: () => {
      mealsQuery.refetch();
    },
    onError: (error) => {
      CrossPlatformAlert.alert(
        "Error",
        `Failed to delete meal: ${error.message}`
      );
    },
  });

  const handleDeleteMeal = (meal: MealWithRecipe) => {
    CrossPlatformAlert.alert(
      "Delete Meal",
      `Are you sure you want to delete "${meal.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMealMutation.mutate({ id: meal.id }),
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.get(),
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor.get(),
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.color.get(),
      textAlign: "center",
    },
    scrollContainer: {
      flex: 1,
    },
    daySection: {
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor.get(),
      paddingVertical: 16,
    },
    dayHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    dayInfo: {
      flex: 1,
    },
    dayName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.color.get(),
    },
    dayDate: {
      fontSize: 14,
      color: theme.gray11.get(),
      marginTop: 2,
    },
    todayIndicator: {
      backgroundColor: theme.blue8.get(),
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    todayText: {
      fontSize: 12,
      fontWeight: "600",
      color: "white",
    },
    mealsContainer: {
      paddingHorizontal: 16,
    },
    mealsScrollView: {
      paddingRight: 16,
    },
    mealItem: {
      backgroundColor: theme.blue2.get(),
      borderRadius: 8,
      padding: 12,
      marginRight: 12,
      minWidth: 140,
      borderLeftWidth: 4,
      borderLeftColor: theme.blue8.get(),
    },
    mealName: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.blue11.get(),
      marginBottom: 4,
    },
    mealDetails: {
      fontSize: 12,
      color: theme.blue10.get(),
      marginBottom: 8,
    },
    addMealButton: {
      backgroundColor: theme.gray3.get(),
      borderRadius: 8,
      padding: 12,
      marginRight: 12,
      minWidth: 100,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.borderColor.get(),
      borderStyle: "dashed",
    },
    addMealText: {
      fontSize: 12,
      color: theme.gray11.get(),
      marginTop: 4,
      textAlign: "center",
    },
    emptyMealsContainer: {
      paddingHorizontal: 16,
      alignItems: "center",
      paddingVertical: 20,
    },
    emptyMealsText: {
      fontSize: 14,
      color: theme.gray10.get(),
      marginBottom: 12,
    },
    addFirstMealButton: {
      backgroundColor: theme.blue3.get(),
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    addFirstMealText: {
      fontSize: 14,
      color: theme.blue11.get(),
      marginLeft: 6,
      fontWeight: "500",
    },
  });

  // Handle loading and error states
  if (mealsQuery.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meal Planning</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.color.get() }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (mealsQuery.error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meal Planning</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.color.get() }}>
            Error loading meals: {mealsQuery.error.message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Planning</Text>
      </View>

      {/* Vertical Day List */}
      <ScrollView style={styles.scrollContainer}>
        {weekDays.map((date, index) => {
          const dateKey = date.toDateString();
          const dayMeals = mealsByDate[dateKey] || [];
          const isToday = date.toDateString() === today.toDateString();

          return (
            <View key={index} style={styles.daySection}>
              {/* Day Header */}
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayName}>
                    {date.toLocaleDateString("en-US", { weekday: "long" })}
                  </Text>
                  <Text style={styles.dayDate}>
                    {date.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                {isToday && (
                  <View style={styles.todayIndicator}>
                    <Text style={styles.todayText}>Today</Text>
                  </View>
                )}
              </View>

              {/* Meals for this day */}
              {dayMeals.length > 0 ? (
                <View style={styles.mealsContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.mealsScrollView}
                  >
                    <TouchableOpacity
                      style={styles.addMealButton}
                      onPress={() => handleAddMeal(date)}
                    >
                      <MaterialIcons
                        name="add"
                        size={20}
                        color={theme.gray11.get()}
                      />
                      <Text style={styles.addMealText}>Add Meal</Text>
                    </TouchableOpacity>
                    {dayMeals.map((meal) => (
                      <TouchableOpacity
                        key={meal.id}
                        style={styles.mealItem}
                        onPress={() => handleEditMeal(meal)}
                      >
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealDetails}>
                          {meal.servings} serving
                          {meal.servings !== 1 ? "s" : ""}
                          {meal.recipe && `\n${meal.recipe.name}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.emptyMealsContainer}>
                  <Text style={styles.emptyMealsText}>No meals planned</Text>
                  <TouchableOpacity
                    style={styles.addFirstMealButton}
                    onPress={() => handleAddMeal(date)}
                  >
                    <MaterialIcons
                      name="add"
                      size={18}
                      color={theme.blue11.get()}
                    />
                    <Text style={styles.addFirstMealText}>Add First Meal</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
