import { LessonsTab } from "@/components/courses/LessonsTab";
import { QuizzesTab } from "@/components/courses/QuizzesTab";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Tab = "lessons" | "quizzes";

export default function CourseContent() {
  const router = useRouter();
  const { courseId, initialTab } = useLocalSearchParams<{ courseId: string; initialTab?: string }>();
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab === "quizzes" ? "quizzes" : "lessons",
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Pill tab bar */}
      <View className="flex-row mx-4 mt-4 mb-2 bg-gray-100 rounded-2xl p-1">
        <Pressable
          onPress={() => setActiveTab("lessons")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "lessons" ? "bg-white" : ""
          }`}
          style={
            activeTab === "lessons"
              ? { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 }
              : undefined
          }
        >
          <Text
            className={`text-sm font-semibold ${
              activeTab === "lessons" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Lessons
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("quizzes")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "quizzes" ? "bg-white" : ""
          }`}
          style={
            activeTab === "quizzes"
              ? { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 }
              : undefined
          }
        >
          <Text
            className={`text-sm font-semibold ${
              activeTab === "quizzes" ? "text-purple-600" : "text-gray-500"
            }`}
          >
            Quizzes
          </Text>
        </Pressable>
      </View>

      {/* Tab content */}
      {courseId ? (
        activeTab === "lessons" ? (
          <LessonsTab courseId={courseId} router={router} />
        ) : (
          <QuizzesTab courseId={courseId} router={router} />
        )
      ) : null}
    </View>
  );
}
