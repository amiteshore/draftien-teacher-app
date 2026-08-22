import { AnnouncementsTab } from "@/components/courses/AnnouncementsTab";
import { LessonsTab } from "@/components/courses/LessonsTab";
import { StudentsTab } from "@/components/courses/StudentsTab";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Tab = "lessons" | "announcements" | "students";

export default function CourseContent() {
  const router = useRouter();
  const { courseId, initialTab } = useLocalSearchParams<{ courseId: string; initialTab?: string }>();
  const [activeTab, setActiveTab] = useState<Tab>(
    (initialTab as Tab) || "lessons",
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Scrollable / pill tab bar */}
      <View className="flex-row mx-3 mt-4 mb-2 bg-gray-100 rounded-2xl p-1">
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
            className={`text-xs font-bold ${
              activeTab === "lessons" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            Lessons
          </Text>
        </Pressable>


        <Pressable
          onPress={() => setActiveTab("announcements")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "announcements" ? "bg-white" : ""
          }`}
          style={
            activeTab === "announcements"
              ? { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 }
              : undefined
          }
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === "announcements" ? "text-amber-600" : "text-gray-500"
            }`}
          >
            Announce
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("students")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "students" ? "bg-white" : ""
          }`}
          style={
            activeTab === "students"
              ? { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 }
              : undefined
          }
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === "students" ? "text-emerald-600" : "text-gray-500"
            }`}
          >
            Students
          </Text>
        </Pressable>
      </View>

      {/* Tab content */}
      {courseId ? (
        activeTab === "lessons" ? (
          <LessonsTab courseId={courseId} router={router} />
        ) : activeTab === "announcements" ? (
          <AnnouncementsTab courseId={courseId} router={router} />
        ) : (
          <StudentsTab courseId={courseId} />
        )
      ) : null}
    </View>
  );
}
