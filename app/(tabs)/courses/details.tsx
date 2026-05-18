import { useCourse, useUpdateCourse } from "@/lib/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

export default function CourseDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: course, isLoading, error, refetch } = useCourse(id);
  const updateCourse = useUpdateCourse(id || "");

  const handleTogglePublish = async (value: boolean) => {
    try {
      await updateCourse.mutateAsync({ isPublished: value });
    } catch {
      Alert.alert("Error", "Failed to update publish status");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !course) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-red-600 text-center mb-4">Failed to load course details</Text>
        <Pressable onPress={() => refetch()} className="bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Thumbnail */}
      {course.thumbnailUrl ? (
        <Image
          source={{ uri: course.thumbnailUrl }}
          style={{ width: "100%", aspectRatio: 16 / 9 }}
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-48 bg-gray-100 items-center justify-center">
          <Ionicons name="image-outline" size={56} color="#D1D5DB" />
        </View>
      )}

      <View className="px-5 pt-5">
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900">{course.title}</Text>

        {/* Badges */}
        <View className="flex-row flex-wrap gap-2 mt-3">
          <View
            className={`px-3 py-1 rounded-full ${course.isPublished ? "bg-green-100" : "bg-yellow-100"}`}
          >
            <Text
              className={`text-xs font-semibold ${course.isPublished ? "text-green-700" : "text-yellow-700"}`}
            >
              {course.isPublished ? "Published" : "Draft"}
            </Text>
          </View>
          {course.category ? (
            <View className="px-3 py-1 rounded-full bg-blue-100">
              <Text className="text-xs font-semibold text-blue-700">{course.category}</Text>
            </View>
          ) : null}
          {course.level ? (
            <View className="px-3 py-1 rounded-full bg-purple-100">
              <Text className="text-xs font-semibold text-purple-700 capitalize">
                {course.level}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Description */}
        {course.description ? (
          <Text className="text-sm text-gray-600 mt-4 leading-5">{course.description}</Text>
        ) : null}

        {/* Course meta */}
        <View className="mt-5 bg-gray-50 rounded-2xl p-4 gap-3">
          {course.price !== undefined ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Price</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {course.price === 0 ? "Free" : `₹${course.price}`}
              </Text>
            </View>
          ) : null}
          {course.durationHours ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Duration</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {course.durationHours} hours
              </Text>
            </View>
          ) : null}
          {course.teacherName ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Instructor</Text>
              <Text className="text-sm font-semibold text-gray-900">{course.teacherName}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Content nav buttons ── */}
        <View className="flex-row gap-3 mt-5">
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/courses/course-content",
                params: { courseId: id, initialTab: "lessons" },
              })
            }
            className="flex-1 bg-blue-600 rounded-2xl p-4 items-center gap-2"
          >
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="book-outline" size={22} color="#FFFFFF" />
            </View>
            <Text className="text-white font-bold text-base">Lessons</Text>
            <Text className="text-blue-100 text-xs">Manage content</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/courses/course-content",
                params: { courseId: id, initialTab: "quizzes" },
              })
            }
            className="flex-1 bg-purple-600 rounded-2xl p-4 items-center gap-2"
          >
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="help-circle-outline" size={22} color="#FFFFFF" />
            </View>
            <Text className="text-white font-bold text-base">Quizzes</Text>
            <Text className="text-purple-100 text-xs">Manage assessments</Text>
          </Pressable>
        </View>

        {/* Publish toggle */}
        <View className="mt-5 flex-row items-center justify-between bg-gray-50 rounded-2xl p-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">Publish Course</Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              {course.isPublished ? "Visible to students" : "Hidden from students"}
            </Text>
          </View>
          <Switch
            value={course.isPublished}
            onValueChange={handleTogglePublish}
            trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Edit button */}
        <Pressable
          onPress={() => router.push({ pathname: "/(tabs)/courses/edit", params: { id } })}
          className="mt-4 bg-gray-900 py-4 rounded-2xl items-center flex-row justify-center gap-2"
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold text-base">Edit Course</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
