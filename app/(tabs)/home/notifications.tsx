import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function Notifications() {
  const [page] = useState(1);
  const { data, isLoading, error, refetch } = useNotifications(page, 20, false);
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert("Mark All as Read", "Mark all notifications as read?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark All",
        onPress: async () => {
          try {
            await markAllAsRead.mutateAsync();
          } catch (err) {
            console.error("Error marking all as read:", err);
            Alert.alert("Error", "Failed to mark all as read");
          }
        },
      },
    ]);
  };

  const handleDelete = (notificationId: string) => {
    Alert.alert("Delete Notification", "Are you sure you want to delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNotification.mutateAsync(notificationId);
          } catch (err) {
            console.error("Error deleting notification:", err);
            Alert.alert("Error", "Failed to delete notification");
          }
        },
      },
    ]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#10B981" };
      case "warning":
        return { name: "warning", color: "#F59E0B" };
      case "error":
        return { name: "close-circle", color: "#EF4444" };
      case "announcement":
        return { name: "megaphone", color: "#8B5CF6" };
      default:
        return { name: "information-circle", color: "#2563EB" };
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F6F8FC] items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#F6F8FC] items-center justify-center px-6">
        <Text className="text-red-600 text-center mb-4">Failed to load notifications</Text>
        <Pressable onPress={() => refetch()} className="bg-blue-600 px-5 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F6F8FC] px-6">
        <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4">
          <Ionicons name="notifications-off-outline" size={48} color="#2563EB" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">No New Notifications</Text>
        <Text className="text-base text-gray-500 text-center">
          You're all caught up! We'll notify you when something new arrives.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F6F8FC]">
      {/* Header with Mark All as Read */}
      {data.unreadCount > 0 && (
        <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between">
          <Text className="text-sm text-gray-600">
            {data.unreadCount} unread notification{data.unreadCount !== 1 ? "s" : ""}
          </Text>
          <Pressable onPress={handleMarkAllAsRead}>
            <Text className="text-sm font-semibold text-blue-600">Mark All as Read</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={data.data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        renderItem={({ item }) => {
          const icon = getNotificationIcon(item.type);
          return (
            <Pressable
              onPress={() => !item.isRead && handleMarkAsRead(item.id)}
              className={`mb-3 bg-white rounded-2xl p-4 border ${
                item.isRead ? "border-gray-200" : "border-blue-200 bg-blue-50"
              }`}
            >
              <View className="flex-row">
                {/* Icon */}
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${icon.color}20` }}
                >
                  <Ionicons name={icon.name as any} size={20} color={icon.color} />
                </View>

                {/* Content */}
                <View className="flex-1">
                  <View className="flex-row items-start justify-between mb-1">
                    <Text
                      className={`flex-1 text-base font-semibold ${
                        item.isRead ? "text-gray-700" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </Text>
                    {!item.isRead && (
                      <View className="w-2 h-2 rounded-full bg-blue-600 ml-2 mt-1.5" />
                    )}
                  </View>

                  <Text
                    className={`text-sm mb-2 ${item.isRead ? "text-gray-500" : "text-gray-700"}`}
                  >
                    {item.message}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-gray-400">
                      {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </Text>

                    {/* Delete Button */}
                    <Pressable
                      onPress={() => handleDelete(item.id)}
                      className="p-1"
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
