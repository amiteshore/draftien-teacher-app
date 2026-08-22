import { NoteRow } from "@/components/courses/NoteRow";
import { uploadFileToSignedUrl, usePdfUpload } from "@/lib/hooks/useUpload";
import {
  useCreateLectureMaterial,
  useDeleteLecture,
  useDeleteLectureMaterial,
  useLectureMaterials,
  useUpdateLecture,
  type Lecture,
} from "@/lib/hooks/useLessons";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import type { Router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialUploading, setMaterialUploading] = useState(false);
  const [uploadedMaterial, setUploadedMaterial] = useState<{ name: string; url: string } | null>(
    null,
  );

  const [editTitle, setEditTitle] = useState(lecture.title);
  const [editDuration, setEditDuration] = useState(
    lecture.durationMinutes ? lecture.durationMinutes.toString() : "",
  );

  const updateLecture = useUpdateLecture(lecture.id, lessonId, courseId);
  const deleteLecture = useDeleteLecture(lessonId, courseId);

  const { data: materials = [] } = useLectureMaterials(expanded ? lecture.id : undefined);
  const createMaterial = useCreateLectureMaterial(lecture.id, lessonId, courseId);
  const deleteMaterial = useDeleteLectureMaterial(lecture.id, lessonId, courseId);
  const pdfUpload = usePdfUpload();

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
      pathname: "/(screens)/course/[id]/lecture-viewer",
      params: {
        id: courseId,
        url: lecture.contentUrl,
        type: lecture.type,
        title: lecture.title,
      },
    });
  };

  const handlePickMaterialFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setMaterialUploading(true);
      const { uploadUrl, publicUrl } = await pdfUpload.mutateAsync({
        fileName: file.name,
        contentType: file.mimeType || "application/pdf",
      });
      const fileBlob = await fetch(file.uri).then((r) => r.blob());
      await uploadFileToSignedUrl(uploadUrl, fileBlob, file.mimeType || "application/pdf");
      setUploadedMaterial({ name: file.name, url: publicUrl });
      if (!materialTitle) setMaterialTitle(file.name);
    } catch {
      Alert.alert("Error", "Failed to upload material");
    } finally {
      setMaterialUploading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!materialTitle.trim()) {
      Alert.alert("Error", "Material title is required");
      return;
    }
    if (!uploadedMaterial) {
      Alert.alert("Error", "Please upload a material file");
      return;
    }
    try {
      await createMaterial.mutateAsync({
        title: materialTitle.trim(),
        fileUrl: uploadedMaterial.url,
        fileType: uploadedMaterial.name.endsWith(".pdf") ? "pdf" : "file",
      });
      setMaterialModalVisible(false);
      setMaterialTitle("");
      setUploadedMaterial(null);
    } catch {
      Alert.alert("Error", "Failed to add lecture material");
    }
  };

  const handleDeleteMaterial = (id: string, title: string) => {
    Alert.alert("Delete Material", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMaterial.mutateAsync(id);
          } catch {
            Alert.alert("Error", "Failed to delete material");
          }
        },
      },
    ]);
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
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-semibold text-gray-700">
                Notes ({lecture.notes.length})
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() =>
                  router.push({
                    pathname: "/(screens)/course/[id]/note-form",
                    params: { lectureId: lecture.id, lessonId, id: courseId },
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
                    pathname: "/(screens)/course/[id]/note-form",
                    params: { lectureId: lecture.id, lessonId, id: courseId },
                  })
                }
                className="bg-gray-50 rounded-lg p-2.5 items-center"
              >
                <Text className="text-xs text-gray-500">Tap to add a note</Text>
              </Pressable>
            )}
          </View>

          {/* Materials */}
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-semibold text-gray-700">
                Materials ({materials.length})
              </Text>
              <Pressable hitSlop={8} onPress={() => setMaterialModalVisible(true)}>
                <Ionicons name="add-circle" size={20} color="#059669" />
              </Pressable>
            </View>

            {materials.length > 0 ? (
              materials.map((mat) => (
                <View
                  key={mat.id}
                  className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2 mb-1.5"
                >
                  <Ionicons name="folder-open-outline" size={16} color="#059669" />
                  <Text className="flex-1 text-xs font-medium text-gray-800 ml-2" numberOfLines={1}>
                    {mat.title}
                  </Text>
                  <View className="flex-row gap-2 ml-2">
                    <Pressable
                      onPress={async () => {
                        if (await Linking.canOpenURL(mat.fileUrl)) {
                          Linking.openURL(mat.fileUrl);
                        }
                      }}
                      hitSlop={8}
                    >
                      <Ionicons name="download-outline" size={16} color="#059669" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteMaterial(mat.id, mat.title)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <Pressable
                onPress={() => setMaterialModalVisible(true)}
                className="bg-gray-50 rounded-lg p-2.5 items-center"
              >
                <Text className="text-xs text-gray-500">Tap to attach lecture materials</Text>
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

      {/* Add Material modal */}
      <Modal
        visible={materialModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMaterialModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Add Lecture Material</Text>
              <Pressable onPress={() => setMaterialModalVisible(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Material Title</Text>
              <TextInput
                value={materialTitle}
                onChangeText={setMaterialTitle}
                placeholder="e.g. Formula Sheet PDF"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">File</Text>
              {uploadedMaterial ? (
                <View className="bg-green-50 border border-green-200 rounded-xl p-3 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-gray-900 flex-1" numberOfLines={1}>
                    {uploadedMaterial.name}
                  </Text>
                  <Pressable onPress={() => setUploadedMaterial(null)}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={handlePickMaterialFile}
                  disabled={materialUploading}
                  className="border border-dashed border-gray-300 rounded-xl p-4 items-center justify-center flex-row gap-2"
                >
                  {materialUploading ? (
                    <ActivityIndicator color="#059669" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color="#059669" />
                      <Text className="text-sm font-semibold text-emerald-700">Choose File</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={handleAddMaterial}
              disabled={createMaterial.isPending || materialUploading}
              className={`py-4 rounded-xl items-center ${
                createMaterial.isPending || materialUploading ? "bg-emerald-400" : "bg-emerald-600"
              }`}
            >
              {createMaterial.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-base">Attach Material</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
