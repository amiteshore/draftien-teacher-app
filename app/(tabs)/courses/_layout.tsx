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
          // headerRight: () => (
          //   <Pressable onPress={() => router.push("/(tabs)/courses/course-form")} hitSlop={8}>
          //     <Ionicons name="add-outline" size={24} color="#1A1A2E" />
          //   </Pressable>
          // ),
        }}
      />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="course-form" options={{ title: "Create Course" }} />
      <Stack.Screen name="details" options={{ title: "Course Details" }} />
      <Stack.Screen name="edit" options={{ title: "Edit Course" }} />

      {/* Content management screen (lessons + quizzes tabs) */}
      <Stack.Screen name="course-content" options={{ title: "Course Content" }} />

      {/* Lecture viewer — full screen */}
      <Stack.Screen
        name="lecture-viewer"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />

      {/* Lesson screens */}
      <Stack.Screen name="lesson-form" options={{ title: "Add Lesson" }} />

      {/* Lecture screens */}
      <Stack.Screen name="lecture-form" options={{ title: "Add Lecture" }} />

      {/* Note screens */}
      <Stack.Screen name="note-form" options={{ title: "Add Note" }} />

      {/* Quiz screens */}
      <Stack.Screen name="quiz-form" options={{ title: "Create Quiz" }} />
      <Stack.Screen name="quiz-details" options={{ title: "Quiz Details" }} />
    </Stack>
  );
}
