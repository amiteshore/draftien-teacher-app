import { useDeleteQuiz, useQuizzesByCourse, type Quiz } from "@/lib/hooks/useQuiz";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Router } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

type QuizCardProps = {
  quiz: Quiz;
  courseId: string;
  router: Router;
};

function QuizCard({ quiz, courseId, router }: QuizCardProps) {
  const deleteQuiz = useDeleteQuiz(courseId);

  const handleDelete = () => {
    Alert.alert("Delete Quiz", `Delete "${quiz.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteQuiz.mutateAsync(quiz.id);
          } catch {
            Alert.alert("Error", "Failed to delete quiz");
          }
        },
      },
    ]);
  };

  return (
    <View className="bg-gray-50 rounded-2xl p-4 mb-3">
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-full bg-purple-600 items-center justify-center mr-3 mt-0.5">
          <Ionicons name="help-circle" size={20} color="#FFFFFF" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">{quiz.title}</Text>
          {quiz.description ? (
            <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
              {quiz.description}
            </Text>
          ) : null}

          {/* Meta badges */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            <View
              className={`px-2 py-1 rounded-full ${quiz.isPublished ? "bg-green-100" : "bg-yellow-100"}`}
            >
              <Text
                className={`text-xs font-medium ${quiz.isPublished ? "text-green-700" : "text-yellow-700"}`}
              >
                {quiz.isPublished ? "Published" : "Draft"}
              </Text>
            </View>
            <View className="px-2 py-1 rounded-full bg-blue-100">
              <Text className="text-xs font-medium text-blue-700">{quiz.durationMinutes} min</Text>
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

          {/* Actions */}
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
              onPress={handleDelete}
              disabled={deleteQuiz.isPending}
              className="bg-red-600 py-2 px-4 rounded-lg items-center justify-center"
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
  );
}

type Props = {
  courseId: string;
  router: Router;
};

export function QuizzesTab({ courseId, router }: Props) {
  const { data: quizzesData, isLoading, error, refetch } = useQuizzesByCourse(courseId);
  const quizzes = quizzesData?.data || [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center py-16 px-6">
        <Text className="text-red-500 text-center mb-4">Failed to load quizzes</Text>
        <Pressable onPress={() => refetch()} className="bg-purple-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-bold text-gray-900">
          {quizzes.length} Quiz{quizzes.length !== 1 ? "zes" : ""}
        </Text>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/(tabs)/courses/quiz-form", params: { courseId } })
          }
          className="flex-row items-center gap-1 bg-purple-600 px-3 py-2 rounded-xl"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text className="text-white text-sm font-semibold">Add Quiz</Text>
        </Pressable>
      </View>

      {quizzes.length > 0 ? (
        quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} courseId={courseId} router={router} />
        ))
      ) : (
        <View className="items-center py-16">
          <Ionicons name="help-circle-outline" size={56} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-900 mt-4">No quizzes yet</Text>
          <Text className="text-sm text-gray-500 mt-1 text-center px-8">
            Add quizzes to test your students' knowledge
          </Text>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(tabs)/courses/quiz-form", params: { courseId } })
            }
            className="bg-purple-600 px-6 py-3 rounded-xl mt-6"
          >
            <Text className="text-white font-semibold">Create First Quiz</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
