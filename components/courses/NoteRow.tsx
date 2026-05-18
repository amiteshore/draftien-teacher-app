import {
  useDeleteLectureNote,
  useUpdateLectureNote,
  type LectureNote,
} from "@/lib/hooks/useLessons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  note: LectureNote;
  lectureId: string;
  lessonId: string;
  courseId: string;
};

export function NoteRow({ note, lectureId, lessonId, courseId }: Props) {
  const [editVisible, setEditVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content || "");

  const deleteNote = useDeleteLectureNote(lectureId, lessonId, courseId);
  const updateNote = useUpdateLectureNote(note.id, lectureId, lessonId, courseId);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }
    try {
      await updateNote.mutateAsync({
        title: editTitle.trim(),
        content: editContent.trim() || undefined,
      });
      setEditVisible(false);
    } catch {
      Alert.alert("Error", "Failed to update note");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", `Delete "${note.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote.mutateAsync(note.id);
          } catch {
            Alert.alert("Error", "Failed to delete note");
          }
        },
      },
    ]);
  };

  const handleOpen = async () => {
    if (!note.contentUrl) return;
    const canOpen = await Linking.canOpenURL(note.contentUrl);
    if (canOpen) await Linking.openURL(note.contentUrl);
    else Alert.alert("Error", "Cannot open this file");
  };

  return (
    <View className="flex-row items-center bg-white border border-gray-100 rounded-lg px-3 py-2 mb-2">
      <Ionicons
        name={note.contentUrl ? "document-text" : "create-outline"}
        size={16}
        color="#6B7280"
      />
      <Text className="flex-1 text-sm text-gray-800 ml-2" numberOfLines={1}>
        {note.title}
      </Text>
      <View className="flex-row gap-3 ml-2">
        {note.contentUrl && (
          <Pressable onPress={handleOpen} hitSlop={8}>
            <Ionicons name="open-outline" size={18} color="#2563EB" />
          </Pressable>
        )}
        <Pressable onPress={() => setEditVisible(true)} hitSlop={8}>
          <Ionicons name="create-outline" size={18} color="#6B7280" />
        </Pressable>
        <Pressable onPress={handleDelete} disabled={deleteNote.isPending} hitSlop={8}>
          {deleteNote.isPending ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          )}
        </Pressable>
      </View>

      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: "80%" }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Edit Note</Text>
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
              {!note.contentUrl && (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Content</Text>
                  <TextInput
                    value={editContent}
                    onChangeText={setEditContent}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                    style={{ minHeight: 120 }}
                  />
                </View>
              )}
              <Pressable
                onPress={handleSave}
                disabled={updateNote.isPending}
                className={`py-4 rounded-xl items-center ${updateNote.isPending ? "bg-gray-400" : "bg-blue-600"}`}
              >
                {updateNote.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-base">Save</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
