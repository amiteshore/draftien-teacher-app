import { useCourse, useUpdateCourse } from "@/lib/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
          className="w-full aspect-video"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full aspect-video bg-gray-100 items-center justify-center">
          <Ionicons name="image-outline" size={56} color="#D1D5DB" />
        </View>
      )}

      <View className="px-5 pt-5">
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900">{course.title}</Text>



        {/* Description */}
        {course.description ? (
          <View className="mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">About this course</Text>
            <Text
              className="text-base text-gray-600 leading-relaxed"
              numberOfLines={isDescriptionExpanded ? undefined : 2}
            >
              {course.description}
            </Text>
            <Pressable onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="mt-1">
              <Text className="text-blue-600 font-medium text-sm">
                {isDescriptionExpanded ? "Read less" : "Read more"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Course meta */}
        <View className="mt-5 bg-gray-50 rounded-2xl p-4 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500">Status</Text>
            <View
              className={`px-3 py-1 rounded-full ${course.isPublished ? "bg-green-100" : "bg-yellow-100"}`}
            >
              <Text
                className={`text-xs font-semibold ${course.isPublished ? "text-green-700" : "text-yellow-700"}`}
              >
                {course.isPublished ? "Published" : "Draft"}
              </Text>
            </View>
          </View>
          {course.category ? (
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500">Category</Text>
              <Text className="text-sm font-semibold text-gray-900">{course.category}</Text>
            </View>
          ) : null}
          {course.level ? (
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500">Level</Text>
              <Text className="text-sm font-semibold text-gray-900 capitalize">{course.level}</Text>
            </View>
          ) : null}
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500">Course Type</Text>
            <View className="items-end">
              {course.price === 0 || !course.price ? (
                <Text className="text-sm font-semibold text-green-600">Free</Text>
              ) : (
                <Text className="text-sm font-semibold text-blue-600">Paid</Text>
              )}
            </View>
          </View>
          {course.price !== undefined && course.price > 0 ? (
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500">Price</Text>
              <View className="items-end">
                {course.effectivePrice !== undefined && course.effectivePrice !== course.price ? (
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs text-gray-400 line-through">₹{course.price}</Text>
                    <Text className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full overflow-hidden">
                      {course.discountType === "percentage" ? `${course.discountValue}% OFF` : `₹${course.discountValue} OFF`}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">₹{course.effectivePrice}</Text>
                  </View>
                ) : (
                  <Text className="text-sm font-semibold text-gray-900">
                    ₹{course.price}
                  </Text>
                )}
              </View>
            </View>
          ) : null}
          {course.durationHours || course.durationValue ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Duration</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {course.durationValue && course.durationType 
                  ? `${course.durationValue} ${course.durationType}` 
                  : `${course.durationHours} hours`}
              </Text>
            </View>
          ) : null}
          {course.availabilityType ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Availability</Text>
              <Text className="text-sm font-semibold text-gray-900 capitalize">
                {course.availabilityType}
              </Text>
            </View>
          ) : null}
          {course.startDate ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Start Date</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {new Date(course.startDate).toLocaleDateString()}
              </Text>
            </View>
          ) : null}
          {course.endDate ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">End Date</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {new Date(course.endDate).toLocaleDateString()}
              </Text>
            </View>
          ) : null}
          {course.teachers && course.teachers.length > 0 ? (
            <View className="flex-col gap-2 mt-1">
              <Text className="text-sm text-gray-500">Instructors</Text>
              <View className="gap-2 pl-3 border-l-2 border-gray-200">
                {course.teachers.map((t, idx) => (
                  <View key={t.id || idx} className="flex-row justify-between items-center">
                    <Text className="text-sm font-semibold text-gray-900">{t.name || t.email || "Unknown"}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : course.teacherName ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Instructor</Text>
              <Text className="text-sm font-semibold text-gray-900">{course.teacherName}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Content nav buttons (Row 1: Lessons) ── */}
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
        </View>

        {/* ── Additional Action buttons (Row 2: Live Class & Announcements) ── */}
        <View className="flex-row gap-3 mt-3">
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/courses/live-class-form",
                params: { courseId: id },
              })
            }
            className="flex-1 bg-red-600 rounded-2xl p-4 items-center gap-2"
          >
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="videocam-outline" size={22} color="#FFFFFF" />
            </View>
            <Text className="text-white font-bold text-base">Live Class</Text>
            <Text className="text-red-100 text-xs">Schedule stream</Text>
          </Pressable>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/courses/announcement-form",
                params: { courseId: id },
              })
            }
            className="flex-1 bg-amber-600 rounded-2xl p-4 items-center gap-2"
          >
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="megaphone-outline" size={22} color="#FFFFFF" />
            </View>
            <Text className="text-white font-bold text-base">Announce</Text>
            <Text className="text-amber-100 text-xs">Notify students</Text>
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
