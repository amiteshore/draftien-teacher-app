import { useCreateLiveClass } from "@/lib/hooks/useLiveClasses";
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

export default function LiveClassForm() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const createLiveClass = useCreateLiveClass();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState(
    new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 16).replace("T", " "),
  );
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [platform, setPlatform] = useState<"inhouse" | "zoom" | "google_meet">("inhouse");

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Title is required");
      return;
    }
    if (!courseId) {
      Alert.alert("Error", "Course ID is missing");
      return;
    }

    try {
      const parsedDate = new Date(scheduledAt.trim().replace(" ", "T"));
      if (Number.isNaN(parsedDate.getTime())) {
        Alert.alert("Validation Error", "Please enter a valid date/time (YYYY-MM-DD HH:MM)");
        return;
      }

      await createLiveClass.mutateAsync({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledAt: parsedDate.toISOString(),
        durationMinutes: Number.parseInt(durationMinutes, 10) || 60,
        platform,
      });

      Alert.alert("Success", "Live class scheduled successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      Alert.alert("Error", msg || "Failed to schedule live class");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Schedule Live Class" }} />
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Class Title <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Physics Doubt Session & Live Problem Solving"
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
              placeholder="What will be covered in this live session?"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Scheduled Date & Time */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Scheduled Date & Time (YYYY-MM-DD HH:MM) <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              value={scheduledAt}
              onChangeText={setScheduledAt}
              placeholder="2026-08-01 18:00"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Duration */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Duration (minutes)</Text>
            <TextInput
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="60"
              keyboardType="number-pad"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Platform */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Streaming Platform</Text>
            <View className="flex-row flex-wrap gap-2">
              {(["inhouse", "google_meet", "zoom"] as const).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setPlatform(item)}
                  className={`flex-1 py-3 px-3 rounded-xl border items-center ${platform === item
                    ? "bg-red-600 border-red-600"
                    : "bg-white border-gray-300"
                    }`}
                >
                  <Text
                    className={`font-semibold capitalize text-xs ${platform === item ? "text-white" : "text-gray-700"
                      }`}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleCreate}
            disabled={createLiveClass.isPending}
            className={`py-4 rounded-xl items-center flex-row justify-center gap-2 ${createLiveClass.isPending ? "bg-red-400" : "bg-red-600"
              }`}
          >
            {createLiveClass.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="videocam" size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold text-base">Schedule Live Class</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
