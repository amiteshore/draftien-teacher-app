import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function CourseScreensLayout() {
  const router = useRouter();

  return (
    <Stack screenOptions={{ headerShown: true, headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen 
        name="details" 
        options={{ 
          title: "Course Details",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4 lg:mr-6" hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </Pressable>
          ),
        }} 
      />
      <Stack.Screen name="edit" options={{ title: "Edit Course" }} />
      <Stack.Screen name="course-content" options={{ title: "Course Content" }} />
      <Stack.Screen
        name="lecture-viewer"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen name="lesson-form" options={{ title: "Add Lesson" }} />
      <Stack.Screen name="lecture-form" options={{ title: "Add Lecture" }} />
      <Stack.Screen name="note-form" options={{ title: "Add Note" }} />
      <Stack.Screen name="live-class-form" options={{ title: "Schedule Live Class" }} />
      <Stack.Screen name="announcement-form" options={{ title: "Post Announcement" }} />
    </Stack>
  );
}
