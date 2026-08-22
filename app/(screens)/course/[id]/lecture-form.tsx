import { uploadFileToSignedUrl, usePdfUpload, useVideoUpload } from "@/lib/hooks/useUpload";
import { useCreateLecture } from "@/lib/hooks/useLessons";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LectureForm() {
  const router = useRouter();
  const { lessonId, id: courseId } = useLocalSearchParams<{ lessonId: string; id: string }>();
  const createLecture = useCreateLecture(courseId || "");
  const videoUpload = useVideoUpload();
  const pdfUpload = usePdfUpload();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"video" | "pdf">("video");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: type === "video" ? "video/*" : "application/pdf",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      await uploadFile(result.assets[0]);
    } catch {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const uploadFile = async (file: DocumentPicker.DocumentPickerAsset) => {
    try {
      setUploading(true);
      const uploadMutation = type === "video" ? videoUpload : pdfUpload;
      const { uploadUrl, publicUrl } = await uploadMutation.mutateAsync({
        fileName: file.name,
        contentType: file.mimeType || "",
      });
      const fileBlob = await fetch(file.uri).then((r) => r.blob());
      await uploadFileToSignedUrl(uploadUrl, fileBlob, file.mimeType || "application/octet-stream");
      setUploadedFile({ name: file.name, url: publicUrl });
    } catch {
      Alert.alert("Error", "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Lecture title is required");
      return;
    }
    if (!lessonId) {
      Alert.alert("Error", "Lesson ID is missing");
      return;
    }

    try {
      const duration = durationMinutes.trim() ? Number.parseInt(durationMinutes, 10) : undefined;
      await createLecture.mutateAsync({
        lessonId,
        title: title.trim(),
        type,
        contentUrl: uploadedFile?.url,
        durationMinutes: duration && Number.isFinite(duration) ? duration : undefined,
        isFree,
      });
      router.back();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      Alert.alert("Error", msg || "Failed to create lecture");
    }
  };

  return (
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
            placeholder="e.g. Introduction to Derivatives"
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            maxLength={255}
          />
        </View>

        {/* Type */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Content Type <Text className="text-red-600">*</Text>
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                setType("video");
                setUploadedFile(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                type === "video" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="videocam"
                  size={20}
                  color={type === "video" ? "#2563EB" : "#6B7280"}
                />
                <Text
                  className={`ml-2 font-medium ${type === "video" ? "text-blue-600" : "text-gray-700"}`}
                >
                  Video
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setType("pdf");
                setUploadedFile(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                type === "pdf" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="document-text"
                  size={20}
                  color={type === "pdf" ? "#2563EB" : "#6B7280"}
                />
                <Text
                  className={`ml-2 font-medium ${type === "pdf" ? "text-blue-600" : "text-gray-700"}`}
                >
                  PDF
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* File Upload */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Upload File</Text>
          {uploadedFile ? (
            <View className="bg-green-50 border border-green-200 rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text className="ml-2 text-sm text-gray-900 flex-1" numberOfLines={1}>
                    {uploadedFile.name}
                  </Text>
                </View>
                <Pressable onPress={() => setUploadedFile(null)}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handlePickFile}
              disabled={uploading}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center"
            >
              {uploading ? (
                <>
                  <ActivityIndicator size="large" color="#2563EB" />
                  <Text className="text-sm text-gray-600 mt-2">Uploading...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
                  <Text className="text-sm font-medium text-gray-900 mt-2">
                    Tap to upload {type === "video" ? "video" : "PDF"}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {type === "video" ? "MP4, MOV, AVI" : "PDF files only"}
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Duration */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Duration (minutes)</Text>
          <TextInput
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            placeholder="e.g. 15"
            keyboardType="number-pad"
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          />
        </View>

        {/* Is Free */}
        <View className="mb-6 flex-row items-center justify-between bg-gray-50 rounded-xl p-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">Free Preview</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Allow non-enrolled students to watch this lecture
            </Text>
          </View>
          <Switch
            value={isFree}
            onValueChange={setIsFree}
            trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleCreate}
          disabled={createLecture.isPending || uploading}
          className={`py-4 rounded-xl items-center ${
            createLecture.isPending || uploading ? "bg-blue-400" : "bg-blue-600"
          }`}
        >
          {createLecture.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Add Lecture</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
