import { useCourse, useDeleteQuiz, useQuizzesByCourse, useUpdateCourse } from "@/lib/hooks";
import { useDeleteLesson, useLessons, useUpdateLesson } from "@/lib/hooks/useLessons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Animated, Linking } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

type LessonAccordionProps = {
  lesson: {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    contentType: string;
    contentUrl: string | null;
    durationMinutes: number | null;
    isFree: boolean;
    isPublished: boolean;
    createdAt: string;
  };
  onPreview: (contentUrl: string | null, contentType: string) => void;
  defaultExpanded?: boolean;
};

function LessonAccordion({ lesson, onPreview, defaultExpanded = false }: LessonAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [animation] = useState(new Animated.Value(defaultExpanded ? 1 : 0));
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState(lesson.title);
  const [editDescription, setEditDescription] = useState(lesson.description || "");
  const [editDuration, setEditDuration] = useState(
    lesson.durationMinutes ? lesson.durationMinutes.toString() : "",
  );

  const updateLesson = useUpdateLesson(lesson.id, lesson.courseId);
  const deleteLesson = useDeleteLesson(lesson.courseId);

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const handleToggleFree = async (value: boolean) => {
    try {
      await updateLesson.mutateAsync({ isFree: value });
    } catch (err) {
      Alert.alert("Error", "Failed to update lesson");
      console.error("Error updating lesson:", err);
    }
  };

  const handleTogglePublish = async (value: boolean) => {
    try {
      await updateLesson.mutateAsync({ isPublished: value });
    } catch (err) {
      Alert.alert("Error", "Failed to update lesson");
      console.error("Error updating lesson:", err);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    try {
      await updateLesson.mutateAsync({
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        durationMinutes: editDuration ? Number.parseInt(editDuration, 10) : undefined,
      });
      setEditModalVisible(false);
    } catch (err) {
      Alert.alert("Error", "Failed to update lesson");
      console.error("Error updating lesson:", err);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Lesson", "Are you sure you want to delete this lesson?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLesson.mutateAsync(lesson.id);
          } catch (err) {
            Alert.alert("Error", "Failed to delete lesson");
            console.error("Error deleting lesson:", err);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const maxHeightInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1000], // Large enough to accommodate any content
  });

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View className="bg-gray-50 rounded-xl mb-3 overflow-hidden">
      {/* Header - Always Visible */}
      <Pressable onPress={toggleExpand} className="p-4 flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-blue-600 items-center justify-center mr-3">
          <Ionicons
            name={
              lesson.contentType === "video"
                ? "videocam"
                : lesson.contentType === "pdf"
                  ? "document-text"
                  : "document"
            }
            size={16}
            color="#FFFFFF"
          />
        </View>
        <Text className="flex-1 text-base font-semibold text-gray-900">{lesson.title}</Text>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          <Ionicons name="chevron-down" size={24} color="#6B7280" />
        </Animated.View>
      </Pressable>

      {/* Expandable Content */}
      <Animated.View
        style={{
          maxHeight: maxHeightInterpolate,
          opacity: animation,
          overflow: "hidden",
        }}
      >
        <View className="px-4 pb-4">
          {lesson.description && (
            <Text className="text-sm text-gray-600 mb-3">{lesson.description}</Text>
          )}

          {/* Created Date */}
          <Text className="text-xs text-gray-500 mb-3">{formatDate(lesson.createdAt)}</Text>

          {lesson.durationMinutes && (
            <Text className="text-sm text-gray-600 mb-3">
              Duration: {lesson.durationMinutes} minutes
            </Text>
          )}

          {/* Switches */}
          <View className="mb-3 space-y-2">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm text-gray-700">Free Lesson</Text>
              <Switch
                value={lesson.isFree}
                onValueChange={handleToggleFree}
                trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                thumbColor="#FFFFFF"
                disabled={updateLesson.isPending}
              />
            </View>
            <View className="flex-row items-center justify-between py-2">
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

          {/* Action Buttons */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => onPreview(lesson.contentUrl, lesson.contentType)}
              className="flex-1 bg-blue-600 py-2 px-4 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="play-circle" size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Preview</Text>
            </Pressable>
            <Pressable
              onPress={() => setEditModalVisible(true)}
              className="bg-gray-600 py-2 px-4 rounded-lg flex-row items-center justify-center"
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              className="bg-red-600 py-2 px-4 rounded-lg flex-row items-center justify-center"
              disabled={deleteLesson.isPending}
            >
              {deleteLesson.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: "80%" }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Edit Lesson</Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView>
              {/* Title */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Title <Text className="text-red-600">*</Text>
                </Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter lesson title"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                />
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Enter lesson description"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                />
              </View>

              {/* Duration */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Duration (minutes)</Text>
                <TextInput
                  value={editDuration}
                  onChangeText={setEditDuration}
                  placeholder="Enter duration in minutes"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                />
              </View>

              {/* Save Button */}
              <Pressable
                onPress={handleEdit}
                disabled={updateLesson.isPending}
                className={`py-4 rounded-xl items-center ${
                  updateLesson.isPending ? "bg-gray-400" : "bg-blue-600"
                }`}
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

export default function CourseDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: course, isLoading, error, refetch } = useCourse(id);
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(id);
  const { data: quizzesData, isLoading: quizzesLoading } = useQuizzesByCourse(id || "");
  const quizzes = quizzesData?.data || [];
  const updateCourse = useUpdateCourse(id || "");
  const deleteQuiz = useDeleteQuiz(id || "");

  const handleTogglePublish = async (value: boolean) => {
    if (!id) return;

    try {
      await updateCourse.mutateAsync({ isPublished: value });
    } catch (err) {
      Alert.alert("Error", "Failed to update publish status");
      console.error("Error updating publish status:", err);
    }
  };

  const handlePreviewLesson = async (contentUrl: string | null, contentType: string) => {
    if (!contentUrl) {
      Alert.alert("Error", "Content URL is not available");
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(contentUrl);
      if (canOpen) {
        await Linking.openURL(contentUrl);
      } else {
        Alert.alert("Error", "Cannot open this file type");
      }
    } catch (err) {
      console.error("Error opening content:", err);
      Alert.alert("Error", "Failed to open content");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !course) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-red-600 text-center mb-4">Failed to load course details</Text>
        <Pressable onPress={() => refetch()} className="bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Thumbnail */}
      {course.thumbnailUrl ? (
        <Image
          source={{ uri: course.thumbnailUrl }}
          style={{ width: "100%", aspectRatio: 16 / 9 }}
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-48 bg-gray-200 items-center justify-center">
          <Ionicons name="image-outline" size={64} color="#9CA3AF" />
        </View>
      )}

      <View className="p-6">
        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900">{course.title}</Text>

        {/* Badges */}
        <View className="flex-row items-center mt-3 flex-wrap gap-2">
          <View
            className={`px-3 py-1 rounded-full ${
              course.isPublished ? "bg-green-100" : "bg-yellow-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                course.isPublished ? "text-green-700" : "text-yellow-700"
              }`}
            >
              {course.isPublished ? "Published" : "Draft"}
            </Text>
          </View>

          {course.category && (
            <View className="px-3 py-1 rounded-full bg-blue-100">
              <Text className="text-xs font-medium text-blue-700">{course.category}</Text>
            </View>
          )}

          {course.level && (
            <View className="px-3 py-1 rounded-full bg-purple-100">
              <Text className="text-xs font-medium text-purple-700 capitalize">{course.level}</Text>
            </View>
          )}
        </View>

        {/* Lessons Section */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Lessons</Text>
            {lessons.length > 0 && (
              <Pressable
                onPress={() =>
                  router.push({ pathname: "/(tabs)/courses/lesson-form", params: { courseId: id } })
                }
                className="flex-row items-center"
              >
                <Ionicons name="add-circle" size={24} color="#2563EB" />
              </Pressable>
            )}
          </View>
          {lessonsLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : lessons.length > 0 ? (
            lessons.map((lesson, index) => (
              <LessonAccordion
                key={lesson.id}
                lesson={lesson}
                onPreview={handlePreviewLesson}
                defaultExpanded={index === 0}
              />
            ))
          ) : (
            <View className="bg-gray-50 rounded-2xl p-6 items-center">
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              <Text className="text-base font-semibold text-gray-900 mt-3">No lessons yet</Text>
              <Text className="text-sm text-gray-600 mt-1 text-center">
                Add your first lesson to start building your course
              </Text>
              <Pressable
                onPress={() =>
                  router.push({ pathname: "/(tabs)/courses/lesson-form", params: { courseId: id } })
                }
                className="bg-blue-600 px-6 py-3 rounded-xl mt-4"
              >
                <Text className="text-white font-semibold">Create First Lesson</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Quizzes Section */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Quizzes</Text>
            <Pressable
              onPress={() =>
                router.push({ pathname: "/(tabs)/courses/quiz-form", params: { courseId: id } })
              }
              className="flex-row items-center"
            >
              <Ionicons name="add-circle" size={24} color="#2563EB" />
            </Pressable>
          </View>
          {quizzesLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
          ) : quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <View key={quiz.id} className="bg-gray-50 rounded-xl p-4 mb-3">
                <View className="flex-row items-start">
                  <View className="w-10 h-10 rounded-full bg-purple-600 items-center justify-center mr-3">
                    <Ionicons name="help-circle" size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1">{quiz.title}</Text>
                    {quiz.description && (
                      <Text className="text-sm text-gray-600 mb-2">{quiz.description}</Text>
                    )}
                    <View className="flex-row flex-wrap gap-2 mb-3">
                      <View
                        className={`px-2 py-1 rounded-full ${
                          quiz.isPublished ? "bg-green-100" : "bg-yellow-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            quiz.isPublished ? "text-green-700" : "text-yellow-700"
                          }`}
                        >
                          {quiz.isPublished ? "Published" : "Draft"}
                        </Text>
                      </View>
                      <View className="px-2 py-1 rounded-full bg-blue-100">
                        <Text className="text-xs font-medium text-blue-700">
                          {quiz.durationMinutes} min
                        </Text>
                      </View>
                      <View className="px-2 py-1 rounded-full bg-purple-100">
                        <Text className="text-xs font-medium text-purple-700">
                          Pass: {quiz.passingScore}%
                        </Text>
                      </View>
                      <View className="px-2 py-1 rounded-full bg-orange-100">
                        <Text className="text-xs font-medium text-orange-700">
                          {quiz.maxAttempts} attempts
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/courses/quiz-details",
                            params: { quizId: quiz.id },
                          })
                        }
                        className="flex-1 bg-purple-600 py-2 rounded-lg items-center"
                      >
                        <Text className="text-white font-semibold text-sm">View Details</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          Alert.alert("Delete Quiz", "Are you sure you want to delete this quiz?", [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: async () => {
                                try {
                                  await deleteQuiz.mutateAsync(quiz.id);
                                } catch (err) {
                                  Alert.alert("Error", "Failed to delete quiz");
                                  console.error("Error deleting quiz:", err);
                                }
                              },
                            },
                          ]);
                        }}
                        className="bg-red-600 py-2 px-4 rounded-lg items-center justify-center"
                        disabled={deleteQuiz.isPending}
                      >
                        {deleteQuiz.isPending ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                        )}
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-gray-50 rounded-2xl p-6 items-center">
              <Ionicons name="help-circle-outline" size={48} color="#9CA3AF" />
              <Text className="text-base font-semibold text-gray-900 mt-3">No quizzes yet</Text>
              <Text className="text-sm text-gray-600 mt-1 text-center">
                Add quizzes to test your students' knowledge
              </Text>
              <Pressable
                onPress={() =>
                  router.push({ pathname: "/(tabs)/courses/quiz-form", params: { courseId: id } })
                }
                className="bg-purple-600 px-6 py-3 rounded-xl mt-4"
              >
                <Text className="text-white font-semibold">Create First Quiz</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Description */}
        {course.description && (
          <View className="mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">About this course</Text>
            <Text className="text-base text-gray-700">{course.description}</Text>
          </View>
        )}

        {/* Course Info */}
        <View className="mt-6 bg-gray-50 rounded-2xl p-4">
          <Text className="text-sm font-semibold text-gray-900 mb-3">Course Information</Text>

          {course.price !== undefined && (
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-600">Price</Text>
              <Text className="text-sm font-medium text-gray-900">
                {course.price === 0 ? "Free" : `₹${course.price}`}
              </Text>
            </View>
          )}

          {course.durationHours && (
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-600">Duration</Text>
              <Text className="text-sm font-medium text-gray-900">
                {course.durationHours} hours
              </Text>
            </View>
          )}

          {course.teacherName && (
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-600">Instructor</Text>
              <Text className="text-sm font-medium text-gray-900">{course.teacherName}</Text>
            </View>
          )}

          {course.lessons && (
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-gray-600">Lessons</Text>
              <Text className="text-sm font-medium text-gray-900">{lessons.length} lessons</Text>
            </View>
          )}
        </View>

        {/* Publish Toggle */}
        <View className="mt-6 flex-row items-center justify-between bg-gray-50 rounded-2xl p-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">Publish Course</Text>
            <Text className="text-sm text-gray-600 mt-1">
              {course.isPublished
                ? "Course is visible to students"
                : "Course is hidden from students"}
            </Text>
          </View>
          <Switch
            value={course.isPublished}
            onValueChange={handleTogglePublish}
            trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Edit Button */}
        <Pressable
          // onPress={() => router.push(`/(tabs)/courses/${id}/edit`)}
          onPress={() => {
            router.push({ pathname: "/(tabs)/courses/edit", params: { id: id } });
          }}
          className="bg-blue-600 py-4 rounded-xl items-center mt-6"
        >
          <Text className="text-white font-semibold text-base">Edit Course</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
