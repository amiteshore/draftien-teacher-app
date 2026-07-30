import { useCreateAnnouncement } from "@/lib/hooks/useAnnouncements";
import { uploadFileToSignedUrl, usePdfUpload } from "@/lib/hooks/useUpload";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
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
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const createAnnouncement = useCreateAnnouncement();
  const pdfUpload = usePdfUpload();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; url: string } | null>(null);

  const handlePickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setUploading(true);
      const { uploadUrl, publicUrl } = await pdfUpload.mutateAsync({
        fileName: file.name,
        contentType: file.mimeType || "application/pdf",
      });
      const fileBlob = await fetch(file.uri).then((r) => r.blob());
      await uploadFileToSignedUrl(uploadUrl, fileBlob, file.mimeType || "application/pdf");
      setAttachment({ name: file.name, url: publicUrl });
    } catch {
      Alert.alert("Error", "Failed to upload attachment");
    } finally {
      setUploading(false);
    }
  };

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
        fileUrl: attachment?.url,
        fileName: attachment?.name,
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
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Message <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Write your announcement message here for enrolled students..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              style={{ minHeight: 120 }}
            />
          </View>

          {/* Attachment */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Optional Attachment</Text>
            {attachment ? (
              <View className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  <Ionicons name="document-attach" size={22} color="#7C3AED" />
                  <Text className="ml-2 text-sm font-semibold text-gray-900 flex-1" numberOfLines={1}>
                    {attachment.name}
                  </Text>
                </View>
                <Pressable onPress={() => setAttachment(null)}>
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickAttachment}
                disabled={uploading}
                className="border-2 border-dashed border-gray-300 rounded-xl p-5 items-center justify-center flex-row gap-2"
              >
                {uploading ? (
                  <ActivityIndicator color="#7C3AED" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={22} color="#6B7280" />
                    <Text className="text-sm font-medium text-gray-700">Attach Document or Image</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleCreate}
            disabled={createAnnouncement.isPending || uploading}
            className={`py-4 rounded-xl items-center flex-row justify-center gap-2 ${
              createAnnouncement.isPending || uploading ? "bg-purple-400" : "bg-purple-600"
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
