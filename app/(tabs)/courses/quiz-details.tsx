import { useQuiz, useUpdateQuiz } from "@/lib/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";

export default function QuizDetailsScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const { data: quizData, isLoading, error, refetch } = useQuiz(quizId || "");
  const quiz = quizData?.data;
  const updateQuiz = useUpdateQuiz(quizId || "", quiz?.courseId || "");

  const handleTogglePublish = async (value: boolean) => {
    if (!quiz) return;

    try {
      await updateQuiz.mutateAsync({ isPublished: value });
    } catch (err) {
      Alert.alert("Error", "Failed to update publish status");
      console.error("Error updating publish status:", err);
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Quiz Details" }} />
        <View className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </>
    );
  }

  if (error || !quiz) {
    return (
      <>
        <Stack.Screen options={{ title: "Quiz Details" }} />
        <View className="flex-1 bg-white items-center justify-center px-6">
          <Text className="text-red-600 text-center mb-4">Failed to load quiz details</Text>
          <Pressable onPress={() => refetch()} className="bg-blue-600 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: quiz.title }} />
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="bg-purple-50 rounded-2xl p-5 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 rounded-full bg-purple-600 items-center justify-center mr-3">
              <Ionicons name="help-circle" size={24} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">{quiz.title}</Text>
              {quiz.description && (
                <Text className="text-sm text-gray-600 mt-1">{quiz.description}</Text>
              )}
            </View>
          </View>

          {/* Badges */}
          <View className="flex-row flex-wrap gap-2">
            <View
              className={`px-3 py-1 rounded-full ${
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
            <View className="px-3 py-1 rounded-full bg-blue-100">
              <Text className="text-xs font-medium text-blue-700">
                {quiz.durationMinutes} minutes
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-purple-100">
              <Text className="text-xs font-medium text-purple-700">
                Pass: {quiz.passingScore}%
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-orange-100">
              <Text className="text-xs font-medium text-orange-700">
                Max {quiz.maxAttempts} attempts
              </Text>
            </View>
          </View>
        </View>

        {/* Quiz Settings */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <Text className="text-base font-bold text-gray-900 mb-3">Quiz Settings</Text>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-gray-600">Duration</Text>
            <Text className="text-sm font-medium text-gray-900">
              {quiz.durationMinutes} minutes
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-gray-600">Passing Score</Text>
            <Text className="text-sm font-medium text-gray-900">{quiz.passingScore}%</Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-gray-600">Maximum Attempts</Text>
            <Text className="text-sm font-medium text-gray-900">{quiz.maxAttempts}</Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-gray-600">Total Questions</Text>
            <Text className="text-sm font-medium text-gray-900">{quiz.questions?.length || 0}</Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-gray-600">Total Points</Text>
            <Text className="text-sm font-medium text-gray-900">
              {quiz.questions?.reduce((sum, q) => sum + q.points, 0) || 0}
            </Text>
          </View>
        </View>

        {/* Questions */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Questions</Text>
          {quiz.questions && quiz.questions.length > 0 ? (
            quiz.questions.map((question, index) => (
              <View key={question.id || index} className="bg-gray-50 rounded-2xl p-4 mb-3">
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="flex-1 text-base font-semibold text-gray-900">
                    {index + 1}. {question.questionText}
                  </Text>
                  <View className="px-2 py-1 rounded-full bg-blue-100 ml-2">
                    <Text className="text-xs font-medium text-blue-700">
                      {question.points} {question.points === 1 ? "pt" : "pts"}
                    </Text>
                  </View>
                </View>

                <View className="px-2 py-1 rounded-full bg-purple-100 self-start mb-3">
                  <Text className="text-xs font-medium text-purple-700 capitalize">
                    {question.questionType.replace("_", " ")}
                  </Text>
                </View>

                {/* Options */}
                {question.options && question.options.length > 0 && (
                  <View className="mb-2">
                    {question.options.map((option, oIndex) => (
                      <View
                        key={oIndex}
                        className={`flex-row items-center p-2 rounded-lg mb-1 ${
                          option === question.correctAnswer ? "bg-green-100" : "bg-white"
                        }`}
                      >
                        <View
                          className={`w-6 h-6 rounded-full items-center justify-center mr-2 ${
                            option === question.correctAnswer ? "bg-green-600" : "bg-gray-300"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              option === question.correctAnswer ? "text-white" : "text-gray-600"
                            }`}
                          >
                            {String.fromCharCode(65 + oIndex)}
                          </Text>
                        </View>
                        <Text
                          className={`flex-1 text-sm ${
                            option === question.correctAnswer
                              ? "text-green-900 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {option}
                        </Text>
                        {option === question.correctAnswer && (
                          <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Correct Answer for short answer */}
                {question.questionType === "short_answer" && (
                  <View className="bg-green-100 p-2 rounded-lg">
                    <Text className="text-xs text-green-700 mb-1">Correct Answer:</Text>
                    <Text className="text-sm font-semibold text-green-900">
                      {question.correctAnswer}
                    </Text>
                  </View>
                )}

                {/* Explanation */}
                {question.explanation && (
                  <View className="mt-2 bg-blue-50 p-2 rounded-lg">
                    <Text className="text-xs text-blue-700 mb-1">Explanation:</Text>
                    <Text className="text-sm text-blue-900">{question.explanation}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-500 text-center py-4">No questions added</Text>
          )}
        </View>

        {/* Publish Toggle */}
        <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-4 mb-4">
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">Publish Quiz</Text>
            <Text className="text-sm text-gray-600 mt-1">
              {quiz.isPublished ? "Quiz is visible to students" : "Quiz is hidden from students"}
            </Text>
          </View>
          <Switch
            value={quiz.isPublished}
            onValueChange={handleTogglePublish}
            trackColor={{ false: "#D1D5DB", true: "#9333EA" }}
            thumbColor="#FFFFFF"
            disabled={updateQuiz.isPending}
          />
        </View>

        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="bg-gray-600 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-semibold text-base">Back to Course</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
