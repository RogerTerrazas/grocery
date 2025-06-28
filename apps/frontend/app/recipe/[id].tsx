import React, { useState } from "react";
import {
  Text,
  YStack,
  XStack,
  useTheme,
  ScrollView,
  Button,
  Input,
  Separator,
  Checkbox,
} from "tamagui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpc } from "../../utils/trpc";
import { SafeAreaView } from "react-native-safe-area-context";
import { CrossPlatformAlert } from "../../components/CrossPlatformAlert";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const utils = trpc.useUtils();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [editedItems, setEditedItems] = useState<
    {
      id?: number;
      name: string;
      checked?: boolean;
      checkedAt?: Date | null;
    }[]
  >([]);

  const recipeQuery = trpc.recipes.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );

  const updateRecipeMutation = trpc.recipes.update.useMutation({
    onSuccess: () => {
      utils.recipes.getById.invalidate({ id: parseInt(id || "0") });
      utils.recipes.getAll.invalidate();
      setIsEditing(false);
      CrossPlatformAlert.alert("Success", "Recipe updated successfully!");
    },
    onError: (error) => {
      CrossPlatformAlert.alert("Error", error.message);
    },
  });

  const deleteRecipeMutation = trpc.recipes.delete.useMutation({
    onSuccess: () => {
      utils.recipes.getAll.invalidate();
      CrossPlatformAlert.alert("Success", "Recipe deleted successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/recipes"),
        },
      ]);
    },
    onError: (error) => {
      CrossPlatformAlert.alert("Error", error.message);
    },
  });

  const toggleCheckedMutation = trpc.groceries.toggleChecked.useMutation({
    onSuccess: () => {
      utils.recipes.getById.invalidate({ id: parseInt(id || "0") });
      utils.groceries.getAll.invalidate();
    },
  });

  React.useEffect(() => {
    if (recipeQuery.data && !isEditing) {
      setEditedName(recipeQuery.data.name);
      setEditedItems(
        recipeQuery.data.groceryItems?.map((item) => ({
          id: item.id,
          name: item.name,
          checked: item.checked,
          checkedAt: item.checkedAt,
        })) || []
      );
    }
  }, [recipeQuery.data, isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedName(recipeQuery.data?.name || "");
    setEditedItems(
      recipeQuery.data?.groceryItems?.map((item) => ({
        id: item.id,
        name: item.name,
        checked: item.checked,
        checkedAt: item.checkedAt,
      })) || []
    );
  };

  const handleSave = () => {
    if (!editedName.trim()) {
      CrossPlatformAlert.alert("Error", "Recipe name cannot be empty");
      return;
    }

    updateRecipeMutation.mutate({
      id: parseInt(id || "0"),
      name: editedName,
      groceryItems: editedItems,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewItemName("");
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      setEditedItems([...editedItems, { name: newItemName.trim() }]);
      setNewItemName("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const handleToggleChecked = (itemId: number) => {
    toggleCheckedMutation.mutate({ id: itemId });
  };

  const handleDeleteRecipe = () => {
    console.log("press delete recipe"); // ← debugging

    CrossPlatformAlert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("alert confirmed, mutating…"); // ← debugging
            deleteRecipeMutation.mutate({ id: parseInt(id || "0") });
          },
        },
      ]
    );
  };

  if (recipeQuery.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack style={{ padding: 16, gap: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "500" }}>
            Loading recipe...
          </Text>
        </YStack>
      </SafeAreaView>
    );
  }

  if (recipeQuery.error || !recipeQuery.data) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack style={{ padding: 16, gap: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "500", color: "red" }}>
            Error: {recipeQuery.error?.message || "Recipe not found"}
          </Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </YStack>
      </SafeAreaView>
    );
  }

  const recipe = recipeQuery.data;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack style={{ flex: 1 }}>
        {/* Header */}
        <XStack
          style={{
            padding: 16,
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor.get(),
          }}
        >
          <Button size="$3" onPress={() => router.back()}>
            ← Back
          </Button>
          <Text style={{ fontSize: 18, fontWeight: "500" }}>
            Recipe Details
          </Text>
          <YStack style={{ width: 60 }} />
        </XStack>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <YStack style={{ padding: 16, gap: 20 }}>
            {/* Recipe Name */}
            <YStack style={{ gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Recipe Name
              </Text>
              {isEditing ? (
                <Input
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter recipe name"
                  style={{
                    borderWidth: 1,
                    borderColor: theme.borderColor.get(),
                    borderRadius: 4,
                    padding: 12,
                  }}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    padding: 12,
                    backgroundColor: theme.background.get(),
                    borderWidth: 1,
                    borderColor: theme.borderColor.get(),
                    borderRadius: 4,
                  }}
                >
                  {recipe.name}
                </Text>
              )}
            </YStack>

            <Separator />

            {/* Grocery Items */}
            <YStack style={{ gap: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                Grocery Items
              </Text>

              {isEditing ? (
                <YStack style={{ gap: 8 }}>
                  {/* Add new item input */}
                  <XStack style={{ gap: 8, alignItems: "center" }}>
                    <Input
                      flex={1}
                      value={newItemName}
                      onChangeText={setNewItemName}
                      placeholder="Add new grocery item"
                      style={{
                        borderWidth: 1,
                        borderColor: theme.borderColor.get(),
                        borderRadius: 4,
                        padding: 12,
                      }}
                    />
                    <Button size="$3" onPress={handleAddItem}>
                      Add
                    </Button>
                  </XStack>

                  {/* Editable items list */}
                  {editedItems.map((item, index) => (
                    <XStack
                      key={index}
                      style={{
                        padding: 12,
                        backgroundColor: theme.background.get(),
                        borderWidth: 1,
                        borderColor: theme.borderColor.get(),
                        borderRadius: 4,
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ flex: 1 }}>{item.name}</Text>
                      <Button
                        size="$2"
                        backgroundColor="red"
                        onPress={() => handleRemoveItem(index)}
                      >
                        Remove
                      </Button>
                    </XStack>
                  ))}
                </YStack>
              ) : (
                <YStack style={{ gap: 8 }}>
                  {recipe.groceryItems && recipe.groceryItems.length > 0 ? (
                    recipe.groceryItems.map((item) => (
                      <XStack
                        key={item.id}
                        style={{
                          padding: 12,
                          gap: 8,
                          alignItems: "center",
                          backgroundColor: theme.background.get(),
                          borderWidth: 1,
                          borderColor: theme.borderColor.get(),
                          borderRadius: 4,
                          opacity: item.checked ? 0.6 : 1,
                        }}
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => handleToggleChecked(item.id)}
                          disabled={toggleCheckedMutation.isPending}
                          backgroundColor={
                            item.checked ? theme.blue10.get() : "transparent"
                          }
                          borderColor={
                            item.checked
                              ? theme.blue10.get()
                              : theme.borderColor.get()
                          }
                        />

                        <Text
                          style={{
                            fontSize: 14,
                            lineHeight: 20,
                            flex: 1,
                            textDecorationLine: item.checked
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {item.name}
                        </Text>

                        {item.checked && item.checkedAt && (
                          <Text
                            style={{
                              fontSize: 10,
                              opacity: 0.5,
                              fontStyle: "italic",
                            }}
                          >
                            ✓ {new Date(item.checkedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </XStack>
                    ))
                  ) : (
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        opacity: 0.6,
                        padding: 12,
                        backgroundColor: theme.background.get(),
                        borderWidth: 1,
                        borderColor: theme.borderColor.get(),
                        borderRadius: 4,
                      }}
                    >
                      No grocery items added yet
                    </Text>
                  )}
                </YStack>
              )}
            </YStack>

            <Separator />

            {/* Action Buttons */}
            <YStack style={{ gap: 12, marginTop: 20 }}>
              {isEditing ? (
                <XStack style={{ gap: 12 }}>
                  <Button
                    flex={1}
                    onPress={handleSave}
                    disabled={updateRecipeMutation.isPending}
                    backgroundColor="green"
                  >
                    {updateRecipeMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    flex={1}
                    onPress={handleCancel}
                    backgroundColor="gray"
                  >
                    Cancel
                  </Button>
                </XStack>
              ) : (
                <XStack style={{ gap: 12 }}>
                  <Button flex={1} onPress={handleStartEdit}>
                    Edit Recipe
                  </Button>
                  <Button
                    flex={1}
                    onPress={handleDeleteRecipe}
                    backgroundColor="red"
                    disabled={deleteRecipeMutation.isPending}
                  >
                    {deleteRecipeMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </XStack>
              )}
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaView>
  );
}
