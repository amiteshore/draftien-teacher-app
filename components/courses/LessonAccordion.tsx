import { LectureAccordion } from "@/components/courses/LectureAccordion";
import {
  useDeleteLesson,
  useUpdateLesson,
  type Lesson,
} from "@/lib/hooks/useLessons";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  lesson: Lesson;
  courseId: string;
  router: Router;
  defaultExpanded?: boolean;
};

export function LessonAccordion({ lesson, courseId, router, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(lesson.title);
  const [editDescription, setEditDescription] = useState(lesson.description || "");

  const updateLesson = useUpdateLesson(lesson.id, courseId);
  const deleteLesson = useDeleteLesson(courseId);

  const handleToggleFree = async (value: boolean) => {
    try {
      await updateLesson.mutateAsync({ isFree: value });
    } catch {
      Alert.alert("Error", "Failed to update lesson");
    }
  };

  const handleTogglePublish = async (value: boolean) => {
    try {
      await updateLesson.mutateAsync({ isPublished: value });
    } catch {
      Alert.alert("Error", "Failed to update lesson");
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    try {
      await updateLesson.mutateAsync({
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setEditVisible(false);
    } catch {
      Alert.alert("Error", "Failed to update lesson");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Lesson", `Delete "${lesson.title}" and all its lectures?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLesson.mutateAsync(lesson.id);
          } catch {
            Alert.alert("Error", "Failed to delete lesson");
          }
        },
      },
    ]);
  };

  return (
    <View className="bg-gray-50 rounded-2xl mb-3 overflow-hidden">
      {/* Header */}
      <Pressable onPress={() => setExpanded(!expanded)} className="flex-row items-center p-4">
        <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center mr-3">
          <Ionicons name="book" size={16} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{lesson.title}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {lesson.lectures.length} lecture{lesson.lectures.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className={`px-2 py-0.5 rounded-full ${lesson.isPublished ? "bg-green-100" : "bg-yellow-100"}`}
          >
            <Text
              className={`text-xs font-medium ${lesson.isPublished ? "text-green-700" : "text-yellow-700"}`}
            >
              {lesson.isPublished ? "Live" : "Draft"}
            </Text>
          </View>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
        </View>
      </Pressable>

      {/* Expanded body */}
      {expanded && (
        <View className="px-4 pb-4 border-t border-gray-200">
          {lesson.description ? (
            <Text className="text-sm text-gray-600 mt-3 mb-3">{lesson.description}</Text>
          ) : null}

          {/* Toggles */}
          <View className="flex-row gap-6 mb-3 mt-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-gray-700">Free Preview</Text>
              <Switch
                value={lesson.isFree}
                onValueChange={handleToggleFree}
                trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
                disabled={updateLesson.isPending}
              />
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-gray-700">Published</Text>
              <Switch
                value={lesson.isPublished}
                onValueChange={handleTogglePublish}
                trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
                disabled={updateLesson.isPending}
              />
            </View>
          </View>

          {/* Lesson actions */}
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => setEditVisible(true)}
              className="flex-1 bg-gray-600 py-2 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              <Text className="text-white text-xs font-semibold ml-1">Edit</Text>
            </Pressable>
            <Pressable
              onPress={handleDelete}
              disabled={deleteLesson.isPending}
              className="bg-red-600 py-2 px-4 rounded-lg items-center justify-center"
            >
              {deleteLesson.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              )}
            </Pressable>
          </View>

          {/* Lectures header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-bold text-gray-900">Lectures</Text>
            <Pressable
              hitSlop={8}
              onPress={() =>
                router.push({
                  pathname: "/(screens)/course/[id]/lecture-form",
                  params: { lessonId: lesson.id, id: courseId },
                })
              }
            >
              <Ionicons name="add-circle" size={22} color="#2563EB" />
            </Pressable>
          </View>

          {lesson.lectures.length > 0 ? (
            lesson.lectures.map((lecture) => (
              <LectureAccordion
                key={lecture.id}
                lecture={lecture}
                lessonId={lesson.id}
                courseId={courseId}
                router={router}
              />
            ))
          ) : (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(screens)/course/[id]/lecture-form",
                  params: { lessonId: lesson.id, id: courseId },
                })
              }
              className="bg-white border border-dashed border-gray-300 rounded-xl p-4 items-center"
            >
              <Ionicons name="videocam-outline" size={28} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 mt-2">Add first lecture</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Edit modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: "80%" }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Edit Lesson</Text>
              <Pressable onPress={() => setEditVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Title</Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                />
              </View>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                />
              </View>
              <Pressable
                onPress={handleSaveEdit}
                disabled={updateLesson.isPending}
                className={`py-4 rounded-xl items-center ${updateLesson.isPending ? "bg-gray-400" : "bg-blue-600"}`}
              >
                {updateLesson.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-base">Save Changes</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
