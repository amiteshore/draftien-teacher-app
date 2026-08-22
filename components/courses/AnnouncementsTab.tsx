import {
  useAnnouncements,
  useDeleteAnnouncement,
  type Announcement,
} from "@/lib/hooks/useAnnouncements";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import type { Router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  Image,
  RefreshControl,
} from "react-native";

type CardProps = {
  announcement: Announcement;
  courseId: string;
};

function AnnouncementCard({ announcement, courseId }: CardProps) {
  const deleteAnnouncement = useDeleteAnnouncement(courseId);

  const handleDelete = () => {
    Alert.alert("Delete Announcement", `Delete "${announcement.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAnnouncement.mutateAsync(announcement.id);
          } catch {
            Alert.alert("Error", "Failed to delete announcement");
          }
        },
      },
    ]);
  };

  const handleOpenAttachment = async (url: string) => {
    if (await Linking.canOpenURL(url)) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open attachment file");
    }
  };

  return (
    <View className="bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-9 h-9 rounded-full bg-amber-100 items-center justify-center mr-2.5">
            <Ionicons name="megaphone" size={18} color="#D97706" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
              {announcement.title}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              {format(new Date(announcement.createdAt), "MMM d, yyyy")}
            </Text>
          </View>
        </View>
        <Pressable onPress={handleDelete} disabled={deleteAnnouncement.isPending} hitSlop={8}>
          {deleteAnnouncement.isPending ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="#000000" />
          )}
        </Pressable>
      </View>

    {!!announcement.content && (
      <Text className="text-sm text-gray-700 leading-5 my-2">{announcement.content}</Text>
    )}

    {/* Attachments */}
      {announcement.attachments && announcement.attachments.length > 0 && (
        <View className="mt-3 pt-3 border-t border-gray-200">
          <Text className="text-xs font-semibold text-gray-500 mb-2">Attachments</Text>
          {announcement.attachments.map((att) => {
            const isImage = att.attachmentType === "image" || att.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            
            if (isImage) {
              return (
                <Pressable key={att.id} onPress={() => handleOpenAttachment(att.fileUrl)} className="mt-2 mb-2">
                  <Image source={{ uri: att.fileUrl }} className="w-full h-48 rounded-xl bg-gray-100" resizeMode="cover" />
                </Pressable>
              );
            }

            return (
              <Pressable
                key={att.id}
                onPress={() => handleOpenAttachment(att.fileUrl)}
                className="flex-row items-center bg-white border border-gray-200 rounded-xl p-2.5 mb-1.5"
              >
                <Ionicons name="document-attach" size={16} color="#7C3AED" />
                <Text className="flex-1 text-xs font-medium text-purple-700 ml-2" numberOfLines={1}>
                  {att.title}
                </Text>
                <Ionicons name="open-outline" size={16} color="#7C3AED" />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

type Props = {
  courseId: string;
  router: Router;
};

export function AnnouncementsTab({ courseId, router }: Props) {
  const { data: announcementsData, isLoading, error, refetch, isRefetching } = useAnnouncements(courseId);
  const announcements = announcementsData?.data || [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-16 px-6">
        <Text className="text-red-500 text-center mb-4">Failed to load announcements</Text>
        <Pressable onPress={() => refetch()} className="bg-amber-600 px-6 py-3 rounded-xl">
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
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#D97706" />}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">
          {announcements.length} Announcement{announcements.length !== 1 ? "s" : ""}
        </Text>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/(tabs)/courses/announcement-form", params: { courseId } })
          }
          className="flex-row items-center gap-1 bg-amber-600 px-3 py-2 rounded-xl"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text className="text-white text-sm font-semibold">Post Announcement</Text>
        </Pressable>
      </View>

      {announcements.length > 0 ? (
        announcements.map((ann) => (
          <AnnouncementCard key={ann.id} announcement={ann} courseId={courseId} />
        ))
      ) : (
        <View className="items-center py-16">
          <Ionicons name="megaphone-outline" size={56} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-900 mt-4">No announcements yet</Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-8">
            Broadcast important updates to all students enrolled in this course
          </Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(tabs)/courses/announcement-form", params: { courseId } })
            }
            className="bg-amber-600 px-6 py-3 rounded-xl mt-6"
          >
            <Text className="text-white font-semibold">Post First Announcement</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
