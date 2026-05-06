import { useAuth } from "@/context/AuthContext";
import { useCourses, useUpcomingLiveClasses } from "@/lib/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_PERMISSION_KEY = "notification_permission_requested";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: liveClassesData, isLoading: liveClassesLoading } = useUpcomingLiveClasses(5);

  const courses = coursesData?.data || [];
  const liveClasses = liveClassesData?.data || [];

  useEffect(() => {
    checkAndRequestNotificationPermission();
  }, []);

  const checkAndRequestNotificationPermission = async () => {
    try {
      const hasAsked = await SecureStore.getItemAsync(NOTIFICATION_PERMISSION_KEY);
      if (hasAsked === "true") return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus === "granted") {
        await SecureStore.setItemAsync(NOTIFICATION_PERMISSION_KEY, "true");
        await setupPushNotifications();
        return;
      }

      if (existingStatus === "undetermined") {
        const { status } = await Notifications.requestPermissionsAsync();
        await SecureStore.setItemAsync(NOTIFICATION_PERMISSION_KEY, "true");

        if (status === "granted") {
          await setupPushNotifications();
        } else {
          Alert.alert(
            "Notifications Disabled",
            "You can enable notifications later in your device settings.",
          );
        }
      } else {
        await SecureStore.setItemAsync(NOTIFICATION_PERMISSION_KEY, "true");
      }
    } catch (error) {
      console.error("Error checking notification permission:", error);
    }
  };

  const setupPushNotifications = async () => {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#2563EB",
        });
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "3f94cb48-48e1-42a0-bcb9-b202c4e730a2",
      });

      console.log("Push token:", token.data);
      // TODO: Send token to backend
    } catch (error) {
      console.error("Error setting up push notifications:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getInitials = () => {
    if (!user?.name) return "T";
    const names = user.name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Calculate stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.filter((c) => !c.isPublished).length;
  const totalValue = courses.reduce((sum, c) => sum + (c.price || 0), 0);

  // Get recent 3 courses
  const recentCourses = courses.slice(0, 3);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F6F8FC]"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting Section */}
      <View className="bg-white px-6 py-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-gray-500">{getGreeting()}</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-1">
              {user?.name || "Teacher"}
            </Text>
          </View>
          <View className="w-14 h-14 rounded-full bg-blue-600 items-center justify-center">
            <Text className="text-white text-lg font-bold">{getInitials()}</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="px-4 mt-4">
        {coursesLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 border border-gray-100">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Ionicons name="book" size={20} color="#2563EB" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">{totalCourses}</Text>
              <Text className="text-sm text-gray-600 mt-1">Total Courses</Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 border border-gray-100">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">{publishedCourses}</Text>
              <Text className="text-sm text-gray-600 mt-1">Published</Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 border border-gray-100">
              <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mb-2">
                <Ionicons name="create" size={20} color="#F59E0B" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">{draftCourses}</Text>
              <Text className="text-sm text-gray-600 mt-1">Drafts</Text>
            </View>

            <View className="flex-1 min-w-[45%] bg-white rounded-2xl p-4 border border-gray-100">
              <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mb-2">
                <Ionicons name="cash" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">₹{totalValue}</Text>
              <Text className="text-sm text-gray-600 mt-1">Total Value</Text>
            </View>
          </View>
        )}
      </View>

      {/* Upcoming Live Classes */}
      {!liveClassesLoading && liveClasses.length > 0 && (
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Upcoming Live Classes</Text>
          </View>

          {liveClasses.map((liveClass) => (
            <View key={liveClass.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
              <View className="flex-row items-start">
                <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mr-3">
                  <Ionicons name="videocam" size={24} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {liveClass.title}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-1">{liveClass.courseTitle}</Text>
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500 ml-1">
                      {formatDateTime(liveClass.scheduledAt)} • {liveClass.durationMinutes} min
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      // TODO: Implement join live class
                      Alert.alert("Join Live Class", "Live class feature coming soon");
                    }}
                    className="bg-red-600 py-2 rounded-lg items-center"
                  >
                    <Text className="text-white font-semibold text-sm">Join Class</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Courses */}
      {!coursesLoading && recentCourses.length > 0 && (
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Recent Courses</Text>
            <Pressable onPress={() => router.push("/(tabs)/courses")}>
              <Text className="text-sm font-semibold text-blue-600">View All</Text>
            </Pressable>
          </View>

          {recentCourses.map((course) => (
            <Pressable
              key={course.id}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/courses/details",
                  params: { id: course.id },
                })
              }
              className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100"
            >
              {course.thumbnailUrl ? (
                <Image
                  source={{ uri: course.thumbnailUrl }}
                  style={{ width: "100%", height: 120 }}
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-32 bg-gray-200 items-center justify-center">
                  <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                </View>
              )}
              <View className="p-4">
                <Text className="text-base font-semibold text-gray-900 mb-2">
                  {course.title}
                </Text>
                <View className="flex-row items-center flex-wrap gap-2">
                  <View
                    className={`px-2 py-1 rounded-full ${
                      course.isPublished ? "bg-green-100" : "bg-yellow-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        course.isPublished ? "text-green-700" : "text-yellow-700"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Text>
                  </View>
                  {course.category && (
                    <View className="px-2 py-1 rounded-full bg-blue-100">
                      <Text className="text-xs font-medium text-blue-700">{course.category}</Text>
                    </View>
                  )}
                  {course.price !== undefined && (
                    <View className="px-2 py-1 rounded-full bg-purple-100">
                      <Text className="text-xs font-medium text-purple-700">
                        {course.price === 0 ? "Free" : `₹${course.price}`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Empty State */}
      {!coursesLoading && courses.length === 0 && (
        <View className="px-4 mt-6">
          <View className="bg-white rounded-2xl p-8 items-center">
            <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Ionicons name="book-outline" size={40} color="#2563EB" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">No Courses Yet</Text>
            <Text className="text-sm text-gray-600 text-center mb-4">
              Start creating your first course to share your knowledge with students
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/courses/course-form")}
              className="bg-blue-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Create Course</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
