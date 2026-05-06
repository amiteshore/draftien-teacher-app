import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { Pressable } from "react-native";

export default function Layout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "My Courses",
          headerRight: () => {
            return (
              <Pressable onPress={() => router.push("/(tabs)/courses/course-form")}>
                <Ionicons name="add-outline" size={24} color="#1A1A2E" />
              </Pressable>
            );
          },
        }}
      />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="course-form"
        options={{
          title: "Create new course",
        }}
      />
      <Stack.Screen
        name="lesson-form"
        options={{
          title: "Create Lesson",
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          title: "Course Details",
        }}
      />
      <Stack.Screen name="edit" options={{ title: "Edit Course" }} />
    </Stack>
  );
}
