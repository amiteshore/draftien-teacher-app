import { useCourseStudents, type EnrolledStudent } from "@/lib/hooks/useCourses";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

function getInitials(name?: string | null) {
  if (!name) return "S";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function StudentRow({ student }: { student: EnrolledStudent }) {
  const progress = Math.min(Math.max(student.progressPercentage || 0, 0), 100);

  return (
    <View className="bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-100 flex-row items-center">
      <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
        <Text className="text-sm font-bold text-blue-600">{getInitials(student.name)}</Text>
      </View>
      <View className="flex-1 mr-2">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {student.name || "Enrolled Student"}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
          {student.email}
        </Text>
        {/* Progress bar */}
        <View className="flex-row items-center gap-2 mt-2">
          <View className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-1.5 bg-blue-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="text-xs font-bold text-blue-600 w-10 text-right">
            {progress.toFixed(0)}%
          </Text>
        </View>
      </View>
      <View className="items-end ml-2">
        <Text className="text-xs text-gray-400">Enrolled</Text>
        <Text className="text-xs font-medium text-gray-600 mt-0.5">
          {student.enrolledAt ? format(new Date(student.enrolledAt), "MMM d, yyyy") : "N/A"}
        </Text>
      </View>
    </View>
  );
}

type Props = {
  courseId: string;
};

export function StudentsTab({ courseId }: Props) {
  const [search, setSearch] = useState("");
  const { data: studentsData, isLoading, error, refetch } = useCourseStudents(courseId);
  const students = studentsData?.data?.students || [];

  const filteredStudents = students.filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase())),
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-16 px-6">
        <Text className="text-red-500 text-center mb-4">Failed to load enrolled students</Text>
        <Pressable onPress={() => refetch()} className="bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 pt-4">
      {/* Header & Search */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-gray-900">
          {students.length} Student{students.length !== 1 ? "s" : ""} Enrolled
        </Text>
      </View>

      {students.length > 0 && (
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mb-4">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search student name or email..."
            className="flex-1 ml-2 text-sm text-gray-900"
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
      )}

      {filteredStudents.length > 0 ? (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StudentRow student={item} />}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="items-center py-16">
          <Ionicons name="people-outline" size={56} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-900 mt-4">
            {search ? "No matching students" : "No enrolled students yet"}
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-8">
            {search ? "Try searching with a different term" : "Enrolled students will appear here"}
          </Text>
        </View>
      )}
    </View>
  );
}
