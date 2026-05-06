import { useAuth } from "@/context/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
// import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function TeacherOnboardingScreen() {
  const { completeOnboarding } = useAuth();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [experience, setExperience] = useState("");
  const [examSpecialization, setExamSpecialization] = useState<"JEE" | "NEET" | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  // const [resume, setResume] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);

  const subjectOptions = {
    JEE: ["Physics", "Chemistry", "Mathematics"],
    NEET: ["Physics", "Chemistry", "Biology"],
  };

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  };

  // const pickResume = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: [
  //         "application/pdf",
  //         "application/msword",
  //         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //       ],
  //       copyToCacheDirectory: true,
  //     });

  //     if (!result.canceled) {
  //       setResume(result.assets[0]);
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to pick the document.");
  //   }
  // };

  const pickResume = () => {
    setResume(null);
  };

  const handleStart = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Information", "Please enter your name.");
      return;
    }

    if (!mobile.trim() || mobile.length < 10) {
      Alert.alert("Invalid Mobile Number", "Enter a valid mobile number.");
      return;
    }

    if (!examSpecialization) {
      Alert.alert("Missing Information", "Please select JEE or NEET.");
      return;
    }

    if (subjects.length === 0) {
      Alert.alert("Missing Information", "Please select at least one subject.");
      return;
    }

    if (!experience.trim()) {
      Alert.alert("Missing Information", "Please enter your experience.");
      return;
    }

    // if (!resume) {
    //   Alert.alert("Missing Information", "Please upload your resume.");
    //   return;
    // }

    try {
      setLoading(true);

      await completeOnboarding({
        name,
        mobile,
        examSpecialization,
        subjects,
        experience,
        resume,
      });

      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mt-10 mb-6">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
            <Ionicons name="person-outline" size={28} color="#4f46e5" />
          </View>
          <Text className="mt-4 text-3xl font-bold text-gray-900">Teacher Onboarding</Text>
          <Text className="mt-1 text-base text-gray-500">
            Share your expertise and start teaching on Draftien.
          </Text>
        </View>

        {/* Name */}
        <View className="mb-5">
          <Text className="mb-2 text-sm font-medium text-gray-700">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            className="rounded-xl border border-gray-300 px-4 py-4 text-base"
          />
        </View>

        {/* Mobile */}
        <View className="mb-5">
          <Text className="mb-2 text-sm font-medium text-gray-700">Mobile Number</Text>
          <TextInput
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="Enter your mobile number"
            className="rounded-xl border border-gray-300 px-4 py-4 text-base"
          />
        </View>

        {/* Exam Selection */}
        <View className="mb-5">
          <Text className="mb-3 text-sm font-medium text-gray-700">Specialization</Text>

          {["JEE", "NEET"].map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setExamSpecialization(item as "JEE" | "NEET");
                setSubjects([]);
              }}
              className="mb-3 flex-row items-center rounded-xl border border-gray-300 px-4 py-4"
            >
              <Ionicons
                name={examSpecialization === item ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={examSpecialization === item ? "#4f46e5" : "#9CA3AF"}
              />
              <Text className="ml-3 text-base text-gray-800">{item}</Text>
            </Pressable>
          ))}
        </View>

        {/* Subjects */}
        {examSpecialization && (
          <View className="mb-5">
            <Text className="mb-3 text-sm font-medium text-gray-700">Subjects</Text>
            <View className="flex-row flex-wrap gap-3">
              {subjectOptions[examSpecialization].map((subject) => {
                const selected = subjects.includes(subject);
                return (
                  <Pressable
                    key={subject}
                    onPress={() => toggleSubject(subject)}
                    className={`flex-row items-center rounded-full border px-4 py-2 ${
                      selected ? "border-indigo-600 bg-indigo-50" : "border-gray-300"
                    }`}
                  >
                    <Ionicons
                      name={selected ? "checkmark-circle" : "ellipse-outline"}
                      size={16}
                      color={selected ? "#4f46e5" : "#9CA3AF"}
                    />
                    <Text
                      className={`ml-2 text-sm font-medium ${
                        selected ? "text-indigo-700" : "text-gray-600"
                      }`}
                    >
                      {subject}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Experience */}
        <View className="mb-5">
          <Text className="mb-2 text-sm font-medium text-gray-700">
            Teaching Experience (Years)
          </Text>
          <TextInput
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
            placeholder="e.g., 3"
            className="rounded-xl border border-gray-300 px-4 py-4 text-base"
          />
        </View>

        {/* Resume Upload */}
        <View className="mb-8">
          <Text className="mb-2 text-sm font-medium text-gray-700">Upload Resume</Text>
          <Pressable
            onPress={pickResume}
            className="flex-row items-center justify-between rounded-xl border border-dashed border-gray-300 px-4 py-4"
          >
            <View className="flex-row items-center">
              <Ionicons name="document-attach-outline" size={20} color="#6b7280" />
              <Text className="ml-2 text-sm text-gray-600">
                {/* {resume ? resume.name : "Upload PDF or DOC"} */}
                {resume ? "Resume" : "Upload PDF or DOC"}
              </Text>
            </View>
            <Ionicons name="cloud-upload-outline" size={20} color="#6b7280" />
          </Pressable>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleStart}
          disabled={loading}
          className={`items-center rounded-xl py-4 ${loading ? "bg-indigo-400" : "bg-indigo-600"}`}
        >
          <Text className="text-base font-semibold text-white">
            {loading ? "Please wait..." : "Let's Start"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
