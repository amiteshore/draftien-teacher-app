import { uploadFileToSignedUrl, useCreateLesson, usePdfUpload, useVideoUpload } from "@/lib/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

type ContentType = "video" | "pdf";

export default function LessonForm() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const createLesson = useCreateLesson();
  const videoUpload = useVideoUpload();
  const pdfUpload = usePdfUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<ContentType>("video");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: contentType === "video" ? "video/*" : "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      await uploadFile(file);
    } catch (err) {
      console.error("Error picking file:", err);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const uploadFile = async (file: DocumentPicker.DocumentPickerAsset) => {
    try {
      setUploading(true);

      // Step 1: Get signed upload URL
      const uploadMutation = contentType === "video" ? videoUpload : pdfUpload;
      const { uploadUrl, publicUrl } = await uploadMutation.mutateAsync({
        fileName: file.name,
        contentType: file.mimeType || "",
      });

      // Step 2: Upload file to signed URL
      const fileBlob = await fetch(file.uri).then((res) => res.blob());
      await uploadFileToSignedUrl(uploadUrl, fileBlob, file.mimeType || "application/octet-stream");

      setUploadedFile({
        name: file.name,
        url: publicUrl,
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      Alert.alert("Error", "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateLesson = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a lesson title");
      return;
    }

    if (!uploadedFile) {
      Alert.alert("Error", "Please upload a file");
      return;
    }

    if (!courseId) {
      Alert.alert("Error", "Course ID is missing");
      return;
    }

    try {
      const lessonData = {
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        contentType,
        contentUrl: uploadedFile.url,
        durationMinutes: durationMinutes ? Number.parseInt(durationMinutes, 10) : undefined,
        isFree,
      };

      await createLesson.mutateAsync(lessonData);
      router.back();
    } catch (err) {
      console.error("Error creating lesson:", err);
      Alert.alert("Error", "Failed to create lesson");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      {/* Title */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Title <Text className="text-red-600">*</Text>
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter lesson title"
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
        />
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter lesson description"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
        />
      </View>

      {/* Content Type */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Content Type <Text className="text-red-600">*</Text>
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => {
              setContentType("video");
              setUploadedFile(null);
            }}
            className={`flex-1 py-3 px-4 rounded-xl border-2 ${
              contentType === "video" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="videocam"
                size={20}
                color={contentType === "video" ? "#2563EB" : "#6B7280"}
              />
              <Text
                className={`ml-2 font-medium ${
                  contentType === "video" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Video
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              setContentType("pdf");
              setUploadedFile(null);
            }}
            className={`flex-1 py-3 px-4 rounded-xl border-2 ${
              contentType === "pdf" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="document-text"
                size={20}
                color={contentType === "pdf" ? "#2563EB" : "#6B7280"}
              />
              <Text
                className={`ml-2 font-medium ${
                  contentType === "pdf" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                PDF
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* File Upload */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Upload File <Text className="text-red-600">*</Text>
        </Text>
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
                  Tap to upload {contentType === "video" ? "video" : "PDF"}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {contentType === "video" ? "MP4, MOV, AVI" : "PDF files only"}
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
          placeholder="Enter duration in minutes"
          keyboardType="numeric"
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
        />
      </View>

      {/* Is Free */}
      <View className="mb-6 flex-row items-center justify-between bg-gray-50 rounded-xl p-4">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">Free Lesson</Text>
          <Text className="text-sm text-gray-600 mt-1">
            Make this lesson available for free preview
          </Text>
        </View>
        <Switch
          value={isFree}
          onValueChange={setIsFree}
          trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Create Button */}
      <Pressable
        onPress={handleCreateLesson}
        disabled={createLesson.isPending || uploading}
        className={`py-4 rounded-xl items-center ${
          createLesson.isPending || uploading ? "bg-gray-400" : "bg-blue-600"
        }`}
      >
        {createLesson.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white font-semibold text-base">Create Lesson</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
