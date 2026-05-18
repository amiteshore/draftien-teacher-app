import { uploadFileToSignedUrl, usePdfUpload } from "@/lib/hooks/useUpload";
import { useCreateLectureNote } from "@/lib/hooks/useLessons";
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
  Text,
  TextInput,
  View,
} from "react-native";

type NoteMode = "pdf" | "text";

export default function NoteForm() {
  const router = useRouter();
  const { lectureId, lessonId, courseId } = useLocalSearchParams<{
    lectureId: string;
    lessonId: string;
    courseId: string;
  }>();
  const createNote = useCreateLectureNote(lectureId || "", lessonId || "", courseId || "");
  const pdfUpload = usePdfUpload();

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<NoteMode>("text");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);

  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
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
      setUploadedFile({ name: file.name, url: publicUrl });
    } catch {
      Alert.alert("Error", "Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Note title is required");
      return;
    }
    if (!lectureId) {
      Alert.alert("Error", "Lecture ID is missing");
      return;
    }
    if (mode === "pdf" && !uploadedFile) {
      Alert.alert("Validation Error", "Please upload a PDF file");
      return;
    }
    if (mode === "text" && !content.trim()) {
      Alert.alert("Validation Error", "Note content cannot be empty");
      return;
    }

    try {
      await createNote.mutateAsync({
        title: title.trim(),
        contentUrl: mode === "pdf" ? uploadedFile?.url : undefined,
        content: mode === "text" ? content.trim() : undefined,
      });
      router.back();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      Alert.alert("Error", msg || "Failed to create note");
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
            placeholder="e.g. Lecture Slides"
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            maxLength={255}
          />
        </View>

        {/* Mode toggle */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Note Type</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => {
                setMode("text");
                setUploadedFile(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                mode === "text" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={mode === "text" ? "#2563EB" : "#6B7280"}
                />
                <Text
                  className={`ml-2 font-medium ${mode === "text" ? "text-blue-600" : "text-gray-700"}`}
                >
                  Text
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setMode("pdf");
                setContent("");
              }}
              className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                mode === "pdf" ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white"
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="document-text"
                  size={20}
                  color={mode === "pdf" ? "#2563EB" : "#6B7280"}
                />
                <Text
                  className={`ml-2 font-medium ${mode === "pdf" ? "text-blue-600" : "text-gray-700"}`}
                >
                  PDF
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Text content */}
        {mode === "text" && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Content <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write your notes here... (Markdown supported)"
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              style={{ minHeight: 160 }}
            />
          </View>
        )}

        {/* PDF upload */}
        {mode === "pdf" && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              PDF File <Text className="text-red-600">*</Text>
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
                onPress={handlePickPdf}
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
                    <Text className="text-sm font-medium text-gray-900 mt-2">Tap to upload PDF</Text>
                    <Text className="text-xs text-gray-500 mt-1">PDF files only</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        )}

        {/* Submit */}
        <Pressable
          onPress={handleCreate}
          disabled={createNote.isPending || uploading}
          className={`py-4 rounded-xl items-center ${
            createNote.isPending || uploading ? "bg-blue-400" : "bg-blue-600"
          }`}
        >
          {createNote.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Add Note</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
