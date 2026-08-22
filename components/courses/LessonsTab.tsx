import { LessonAccordion } from "@/components/courses/LessonAccordion";
import { useLessons } from "@/lib/hooks/useLessons";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View, RefreshControl } from "react-native";

type Props = {
  courseId: string;
  router: Router;
};

export function LessonsTab({ courseId, router }: Props) {
  const { data: lessons = [], isLoading, error, refetch, isRefetching } = useLessons(courseId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-16 px-6">
        <Text className="text-red-500 text-center mb-4">Failed to load lessons</Text>
        <Pressable onPress={() => refetch()} className="bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">
          {lessons.length} Lesson{lessons.length !== 1 ? "s" : ""}
        </Text>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/(tabs)/courses/lesson-form", params: { courseId } })
          }
          className="flex-row items-center gap-1 bg-blue-600 px-3 py-2 rounded-xl"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text className="text-white text-sm font-semibold">Add Lesson</Text>
        </Pressable>
      </View>

      {lessons.length > 0 ? (
        lessons.map((lesson, index) => (
          <LessonAccordion
            key={lesson.id}
            lesson={lesson}
            courseId={courseId}
            router={router}
            defaultExpanded={index === 0}
          />
        ))
      ) : (
        <View className="items-center py-16">
          <Ionicons name="book-outline" size={56} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-900 mt-4">No lessons yet</Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-8">
            Add your first lesson to start building your course content
          </Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(tabs)/courses/lesson-form", params: { courseId } })
            }
            className="bg-blue-600 px-6 py-3 rounded-xl mt-6"
          >
            <Text className="text-white font-semibold">Create First Lesson</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
