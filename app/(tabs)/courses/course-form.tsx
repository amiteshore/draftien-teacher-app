import { useCreateCourse } from "@/lib/hooks";
import { Stack, useRouter } from "expo-router";
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

type CourseFormData = {
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  price: string;
  durationHours: string;
  level: "beginner" | "intermediate" | "advanced";
};

export default function CourseForm() {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    thumbnailUrl: "",
    category: "",
    price: "",
    durationHours: "",
    level: "beginner",
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert("Validation Error", "Course title is required");
      return;
    }

    try {
      const payload: {
        title: string;
        description?: string;
        thumbnailUrl?: string;
        category?: string;
        price?: number;
        durationHours?: number;
        level: string;
      } = {
        title: formData.title.trim(),
        level: formData.level,
      };

      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      if (formData.thumbnailUrl.trim()) {
        payload.thumbnailUrl = formData.thumbnailUrl.trim();
      }

      if (formData.category.trim()) {
        payload.category = formData.category.trim();
      }

      if (formData.price.trim()) {
        const priceNum = Number.parseFloat(formData.price);
        if (Number.isFinite(priceNum) && priceNum >= 0) {
          payload.price = priceNum;
        }
      }

      if (formData.durationHours.trim()) {
        const durationNum = Number.parseInt(formData.durationHours, 10);
        if (Number.isFinite(durationNum) && durationNum > 0) {
          payload.durationHours = durationNum;
        }
      }

      const course = await createCourse.mutateAsync(payload);
      router.replace({ pathname: "/(tabs)/courses/details", params: { id: course.id } });
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      Alert.alert("Error", errorMessage || "Failed to create course. Please try again.");
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
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            placeholder="Enter course title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            maxLength={255}
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            placeholder="Enter course description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Thumbnail URL */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Thumbnail URL</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            placeholder="https://example.com/image.jpg"
            value={formData.thumbnailUrl}
            onChangeText={(text) => setFormData({ ...formData, thumbnailUrl: text })}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
          <View className="flex-row gap-2">
            {(["JEE", "NEET"] as const).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setFormData({ ...formData, category: cat })}
                className={`flex-1 py-3 rounded-xl border ${
                  formData.category === cat
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    formData.category === cat ? "text-white" : "text-gray-700"
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Price */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Price (₹)</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            placeholder="0"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Duration Hours */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Duration (Hours)</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            placeholder="e.g., 10"
            value={formData.durationHours}
            onChangeText={(text) => setFormData({ ...formData, durationHours: text })}
            keyboardType="number-pad"
          />
        </View>

        {/* Level */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Level</Text>
          <View className="flex-row gap-2">
            {(["beginner", "intermediate", "advanced"] as const).map((level) => (
              <Pressable
                key={level}
                onPress={() => setFormData({ ...formData, level })}
                className={`flex-1 py-3 rounded-xl border ${
                  formData.level === level
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-center font-medium capitalize ${
                    formData.level === level ? "text-white" : "text-gray-700"
                  }`}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={createCourse.isPending}
          className={`py-4 rounded-xl items-center ${createCourse.isPending ? "bg-blue-400" : "bg-blue-600"}`}
        >
          {createCourse.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Create Course</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
