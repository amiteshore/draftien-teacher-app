import { useCourses } from "@/lib/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, Pressable, Text, View, RefreshControl } from "react-native";

export default function Courses() {
  const router = useRouter();
  const { data: courses = [], isLoading, error, refetch, isRefetching } = useCourses();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-red-600 text-center mb-4">Failed to load courses</Text>
        <Pressable onPress={() => refetch()} className="bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="book-outline" size={64} color="#9CA3AF" />
        <Text className="text-xl font-semibold text-gray-900 mt-4">You have no courses</Text>
        <Text className="text-base text-gray-500 mt-2 text-center">
          Create your first course to start teaching
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/courses/course-form")}
          className="bg-blue-600 px-6 py-3 rounded-xl mt-6"
        >
          <Text className="text-white font-semibold">Create New Course</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(tabs)/courses/details", params: { id: item.id } })
            }
            className="bg-gray-50 rounded-2xl p-4 mb-4"
          >
            <View className="flex-row items-start justify-between">
              {/* Thumbnail */}
              {item.thumbnailUrl ? (
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  className="w-20 h-20 rounded-xl mr-3"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-20 h-20 rounded-xl mr-3 bg-gray-300 items-center justify-center">
                  <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                </View>
              )}

              {/* Content */}
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">{item.title}</Text>
                {item.description && (
                  <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View className="flex-row items-center mt-2">
                  <View
                    className={`px-2 py-1 rounded-full ${
                      item.isPublished ? "bg-green-100" : "bg-yellow-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        item.isPublished ? "text-green-700" : "text-yellow-700"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </Text>
                  </View>
                  {item.category && (
                    <Text className="text-xs text-gray-500 ml-2">{item.category}</Text>
                  )}
                </View>
              </View>

              {/* Chevron */}
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" className="ml-2" />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
