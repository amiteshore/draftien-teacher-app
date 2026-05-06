import { useProfile, useUpdateProfile, useUpdateTeacherProfile } from "@/lib/hooks";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateTeacherProfile = useUpdateTeacherProfile();

  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [subjects, setSubjects] = useState("");
  const [experience, setExperience] = useState("");
  const [examSpecialization, setExamSpecialization] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setMobileNumber(profile.mobileNumber || "");

      if (profile.role === "teacher" && profile.profile) {
        setSubjects(profile.profile.subjects?.join(", ") || "");
        setExperience(profile.profile.experience?.toString() || "");
        setExamSpecialization(profile.profile.examSpecialization || "");
      }
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      // Update basic profile
      await updateProfile.mutateAsync({
        name: name.trim(),
        mobileNumber: mobileNumber.trim() || undefined,
      });

      // Update teacher profile if user is a teacher
      if (profile?.role === "teacher") {
        const subjectsArray = subjects
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        await updateTeacherProfile.mutateAsync({
          subjects: subjectsArray.length > 0 ? subjectsArray : undefined,
          experience: experience ? Number.parseInt(experience, 10) : undefined,
          examSpecialization: examSpecialization.trim() || undefined,
        });
      }

      router.back();
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Edit Profile",
          }}
        />
        <View className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Basic Information */}
        <Text className="text-lg font-bold text-gray-900 mb-4">Basic Information</Text>

        {/* Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Name <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          />
        </View>

        {/* Email (Read-only) */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
          <View className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3">
            <Text className="text-base text-gray-500">{profile?.email}</Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1">Email cannot be changed</Text>
        </View>

        {/* Mobile Number */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Mobile Number</Text>
          <TextInput
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="Enter your mobile number"
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          />
        </View>

        {/* Teacher Profile Section */}
        {profile?.role === "teacher" && (
          <>
            <Text className="text-lg font-bold text-gray-900 mb-4 mt-2">Teacher Profile</Text>

            {/* Subjects */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Subjects (comma separated)
              </Text>
              <TextInput
                value={subjects}
                onChangeText={setSubjects}
                placeholder="e.g., Physics, Chemistry, Mathematics"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>

            {/* Experience */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Experience (years)</Text>
              <TextInput
                value={experience}
                onChangeText={setExperience}
                placeholder="Enter years of experience"
                keyboardType="numeric"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>

            {/* Exam Specialization */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Exam Specialization</Text>
              <TextInput
                value={examSpecialization}
                onChangeText={setExamSpecialization}
                placeholder="e.g., JEE, NEET"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>
          </>
        )}

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={updateProfile.isPending || updateTeacherProfile.isPending}
          className={`py-4 rounded-xl items-center ${
            updateProfile.isPending || updateTeacherProfile.isPending
              ? "bg-gray-400"
              : "bg-blue-600"
          }`}
        >
          {updateProfile.isPending || updateTeacherProfile.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
