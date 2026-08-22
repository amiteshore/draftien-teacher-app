import { useCreateAnnouncement } from "@/lib/hooks/useAnnouncements";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AnnouncementForm() {
  const router = useRouter();
  const { id: courseId } = useLocalSearchParams<{ id: string }>();
  const createAnnouncement = useCreateAnnouncement();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Title is required");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Validation Error", "Message is required");
      return;
    }
    if (!courseId) {
      Alert.alert("Error", "Course ID is missing");
      return;
    }

    try {
      await createAnnouncement.mutateAsync({
        courseId,
        title: title.trim(),
        message: message.trim(),
        targetingType: "course",
      });

      Alert.alert("Success", "Announcement posted!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      Alert.alert("Error", msg || "Failed to post announcement");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Post Announcement" }} />
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Title <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Test Schedule Updated"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              maxLength={255}
            />
          </View>

          {/* Message */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Content <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Write your announcement content here for enrolled students..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              style={{ minHeight: 120 }}
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleCreate}
            disabled={createAnnouncement.isPending}
            className={`py-4 rounded-xl items-center flex-row justify-center gap-2 ${
              createAnnouncement.isPending ? "bg-purple-400" : "bg-purple-600"
            }`}
          >
            {createAnnouncement.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="megaphone" size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold text-base">Broadcast Announcement</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
