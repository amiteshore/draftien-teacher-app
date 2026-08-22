import { useCreateLesson } from "@/lib/hooks/useLessons";
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

export default function LessonForm() {
  const router = useRouter();
  const { id: courseId } = useLocalSearchParams<{ id: string }>();
  const createLesson = useCreateLesson();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Lesson title is required");
      return;
    }
    if (!courseId) {
      Alert.alert("Error", "Course ID is missing");
      return;
    }

    try {
      await createLesson.mutateAsync({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        isFree,
      });
      router.back();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      Alert.alert("Error", msg || "Failed to create lesson");
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
            placeholder="e.g. Introduction to Calculus"
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            maxLength={255}
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What will students learn in this lesson?"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          />
        </View>

        {/* Is Free */}
        <View className="mb-6 flex-row items-center justify-between bg-gray-50 rounded-xl p-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">Free Preview</Text>
            <Text className="text-sm text-gray-600 mt-1">
              Allow non-enrolled students to see this lesson
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
          disabled={createLesson.isPending}
          className={`py-4 rounded-xl items-center ${createLesson.isPending ? "bg-blue-400" : "bg-blue-600"}`}
        >
          {createLesson.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Create Lesson</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
