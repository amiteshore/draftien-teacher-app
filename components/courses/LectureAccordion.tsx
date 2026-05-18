import { NoteRow } from "@/components/courses/NoteRow";
import {
  useDeleteLecture,
  useUpdateLecture,
  type Lecture,
} from "@/lib/hooks/useLessons";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  lecture: Lecture;
  lessonId: string;
  courseId: string;
  router: Router;
};

export function LectureAccordion({ lecture, lessonId, courseId, router }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(lecture.title);
  const [editDuration, setEditDuration] = useState(
    lecture.durationMinutes ? lecture.durationMinutes.toString() : "",
  );

  const updateLecture = useUpdateLecture(lecture.id, lessonId, courseId);
  const deleteLecture = useDeleteLecture(lessonId, courseId);

  const handleToggleFree = async (value: boolean) => {
    try {
      await updateLecture.mutateAsync({ isFree: value });
    } catch {
      Alert.alert("Error", "Failed to update lecture");
    }
  };

  const handleTogglePublish = async (value: boolean) => {
    try {
      await updateLecture.mutateAsync({ isPublished: value });
    } catch {
      Alert.alert("Error", "Failed to update lecture");
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    try {
      const duration = editDuration.trim() ? Number.parseInt(editDuration, 10) : undefined;
      await updateLecture.mutateAsync({
        title: editTitle.trim(),
        durationMinutes: duration && Number.isFinite(duration) ? duration : undefined,
      });
      setEditVisible(false);
    } catch {
      Alert.alert("Error", "Failed to update lecture");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Lecture", `Delete "${lecture.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLecture.mutateAsync(lecture.id);
          } catch {
            Alert.alert("Error", "Failed to delete lecture");
          }
        },
      },
    ]);
  };

  const handlePreview = () => {
    if (!lecture.contentUrl) {
      Alert.alert("No content", "This lecture has no content URL yet");
      return;
    }
    router.push({
      pathname: "/(tabs)/courses/lecture-viewer",
      params: {
        url: lecture.contentUrl,
        type: lecture.type,
        title: lecture.title,
      },
    });
  };

  return (
    <View className="bg-white border border-gray-200 rounded-xl mb-2 overflow-hidden">
      {/* Row header */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center px-3 py-3"
      >
        <View
          className={`w-7 h-7 rounded-full items-center justify-center mr-2 ${
            lecture.type === "video" ? "bg-purple-100" : "bg-orange-100"
          }`}
        >
          <Ionicons
            name={lecture.type === "video" ? "videocam" : "document-text"}
            size={14}
            color={lecture.type === "video" ? "#7C3AED" : "#EA580C"}
          />
        </View>
        <Text className="flex-1 text-sm font-semibold text-gray-900" numberOfLines={1}>
          {lecture.title}
        </Text>
        {lecture.durationMinutes ? (
          <Text className="text-xs text-gray-500 mr-2">{lecture.durationMinutes}m</Text>
        ) : null}
        <View
          className={`px-2 py-0.5 rounded-full mr-2 ${lecture.isPublished ? "bg-green-100" : "bg-yellow-100"}`}
        >
          <Text
            className={`text-xs font-medium ${lecture.isPublished ? "text-green-700" : "text-yellow-700"}`}
          >
            {lecture.isPublished ? "Live" : "Draft"}
          </Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color="#9CA3AF" />
      </Pressable>

      {/* Expanded body */}
      {expanded && (
        <View className="px-3 pb-3 border-t border-gray-100">
          {/* Toggles */}
          <View className="flex-row gap-4 py-2">
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-600">Free</Text>
              <Switch
                value={lecture.isFree}
                onValueChange={handleToggleFree}
                trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
                disabled={updateLecture.isPending}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-600">Published</Text>
              <Switch
                value={lecture.isPublished}
                onValueChange={handleTogglePublish}
                trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
                disabled={updateLecture.isPending}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-2 mb-3">
            <Pressable
              onPress={handlePreview}
              className="flex-1 bg-blue-600 py-2 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="play-circle" size={16} color="#FFFFFF" />
              <Text className="text-white text-xs font-semibold ml-1">Preview</Text>
            </Pressable>
            <Pressable
              onPress={() => setEditVisible(true)}
              className="bg-gray-600 py-2 px-3 rounded-lg items-center justify-center"
            >
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              disabled={deleteLecture.isPending}
              className="bg-red-600 py-2 px-3 rounded-lg items-center justify-center"
            >
              {deleteLecture.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              )}
            </Pressable>
          </View>

          {/* Notes */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-semibold text-gray-700">
                Notes ({lecture.notes.length})
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/courses/note-form",
                    params: { lectureId: lecture.id, lessonId, courseId },
                  })
                }
              >
                <Ionicons name="add-circle" size={20} color="#2563EB" />
              </Pressable>
            </View>

            {lecture.notes.length > 0 ? (
              lecture.notes.map((note) => (
                <NoteRow
                  key={note.id}
                  note={note}
                  lectureId={lecture.id}
                  lessonId={lessonId}
                  courseId={courseId}
                />
              ))
            ) : (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/courses/note-form",
                    params: { lectureId: lecture.id, lessonId, courseId },
                  })
                }
                className="bg-gray-50 rounded-lg p-3 items-center"
              >
                <Text className="text-xs text-gray-500">Tap to add a note</Text>
              </Pressable>
            )}
          </View>
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
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Edit Lecture</Text>
              <Pressable onPress={() => setEditVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Title</Text>
              <TextInput
                value={editTitle}
                onChangeText={setEditTitle}
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Duration (minutes)</Text>
              <TextInput
                value={editDuration}
                onChangeText={setEditDuration}
                keyboardType="number-pad"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>
            <Pressable
              onPress={handleSaveEdit}
              disabled={updateLecture.isPending}
              className={`py-4 rounded-xl items-center ${updateLecture.isPending ? "bg-gray-400" : "bg-blue-600"}`}
            >
              {updateLecture.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-base">Save Changes</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
