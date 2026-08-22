import { useCreateLiveClass } from "@/lib/hooks/useLiveClasses";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LiveClassForm() {
  const router = useRouter();
  const { id: courseId } = useLocalSearchParams<{ id: string }>();
  const createLiveClass = useCreateLiveClass();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    () => new Date(Date.now() + 3600 * 1000),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [platform, setPlatform] = useState<"inhouse" | "zoom" | "google_meet">("inhouse");

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && selectedDate) {
      const updated = new Date(scheduledDate);
      updated.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
      setScheduledDate(updated);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (event.type === "set" && selectedDate) {
      const updated = new Date(scheduledDate);
      updated.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      setScheduledDate(updated);
    }
  };

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
      if (Number.isNaN(scheduledDate.getTime())) {
        Alert.alert("Validation Error", "Please select a valid date/time.");
        return;
      }

      await createLiveClass.mutateAsync({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledAt: scheduledDate.toISOString(),
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
              Scheduled Date & Time <Text className="text-red-600">*</Text>
            </Text>
            <View className="flex-row gap-3">
              {/* Date Button */}
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="flex-1 flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-white"
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="calendar-outline" size={18} color="#4B5563" />
                  <Text className="text-base text-gray-900">
                    {format(scheduledDate, "MMM d, yyyy")}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
              </Pressable>

              {/* Time Button */}
              <Pressable
                onPress={() => setShowTimePicker(true)}
                className="flex-1 flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-white"
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="time-outline" size={18} color="#4B5563" />
                  <Text className="text-base text-gray-900">
                    {format(scheduledDate, "h:mm a")}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
              </Pressable>
            </View>
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

      {/* Android Date Picker */}
      {Platform.OS === "android" && showDatePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Android Time Picker */}
      {Platform.OS === "android" && showTimePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* iOS Date Picker Modal */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <Pressable
              className="flex-1"
              onPress={() => setShowDatePicker(false)}
            />
            <View className="bg-white rounded-t-3xl pb-8">
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
                <Text className="text-base font-semibold text-gray-800">Select Date</Text>
                <Pressable
                  onPress={() => setShowDatePicker(false)}
                  className="px-2 py-1"
                >
                  <Text className="text-base font-semibold text-red-600">Done</Text>
                </Pressable>
              </View>
              <View className="items-center py-4">
                <DateTimePicker
                  value={scheduledDate}
                  mode="date"
                  display="inline"
                  onChange={handleDateChange}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* iOS Time Picker Modal */}
      {Platform.OS === "ios" && (
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <Pressable
              className="flex-1"
              onPress={() => setShowTimePicker(false)}
            />
            <View className="bg-white rounded-t-3xl pb-8">
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
                <Text className="text-base font-semibold text-gray-800">Select Time</Text>
                <Pressable
                  onPress={() => setShowTimePicker(false)}
                  className="px-2 py-1"
                >
                  <Text className="text-base font-semibold text-red-600">Done</Text>
                </Pressable>
              </View>
              <View className="items-center py-4">
                <DateTimePicker
                  value={scheduledDate}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
