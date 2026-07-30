import { type QuizQuestion, useCreateQuiz } from "@/lib/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function QuizFormScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const createQuiz = useCreateQuiz();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [passingScore, setPassingScore] = useState("70");
  const [maxAttempts, setMaxAttempts] = useState("3");
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: Math.random().toString(),
      questionText: "",
      questionType: "mcq",
      options: ["", ""],
      correctAnswer: "",
      points: 1,
      orderIndex: 0,
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(),
        questionText: "",
        questionType: "mcq",
        options: ["", ""],
        correctAnswer: "",
        points: 1,
        orderIndex: questions.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      Alert.alert("Error", "Quiz must have at least one question");
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions.map((q, i) => ({ ...q, orderIndex: i })));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index]!, [field]: value };
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex]!;
    if (question.options.length >= 6) {
      Alert.alert("Error", "Maximum 6 options allowed");
      return;
    }
    question.options.push("");
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex]!;
    if (question.options.length <= 2) {
      Alert.alert("Error", "Minimum 2 options required");
      return;
    }
    question.options.splice(optionIndex, 1);
    setQuestions(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex]!.options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Quiz title is required");
      return;
    }

    if (!courseId) {
      Alert.alert("Error", "Course ID is missing");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]!;
      if (!q.questionText.trim()) {
        Alert.alert("Error", `Question ${i + 1}: Question text is required`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        Alert.alert("Error", `Question ${i + 1}: All options must be filled`);
        return;
      }
      if (!q.correctAnswer.trim()) {
        Alert.alert("Error", `Question ${i + 1}: Correct answer is required`);
        return;
      }
    }

    try {
      await createQuiz.mutateAsync({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes: Number.parseInt(durationMinutes, 10),
        passingScore: Number.parseInt(passingScore, 10),
        maxAttempts: Number.parseInt(maxAttempts, 10),
        questions: questions.map((q) => ({
          ...q,
          questionText: q.questionText.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctAnswer: q.correctAnswer.trim(),
        })),
      });

      router.back();
    } catch (err) {
      console.error("Error creating quiz:", err);
      Alert.alert("Error", "Failed to create quiz");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create Quiz",
        }}
      />
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Quiz Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Quiz Title <Text className="text-red-600">*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter quiz title"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter quiz description"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Settings Row */}
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Duration (min)</Text>
              <TextInput
                value={durationMinutes}
                onChangeText={setDurationMinutes}
                placeholder="30"
                keyboardType="numeric"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Passing %</Text>
              <TextInput
                value={passingScore}
                onChangeText={setPassingScore}
                placeholder="70"
                keyboardType="numeric"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Max Attempts</Text>
              <TextInput
                value={maxAttempts}
                onChangeText={setMaxAttempts}
                placeholder="3"
                keyboardType="numeric"
                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </View>
          </View>

          {/* Questions */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">Questions</Text>
              <Pressable onPress={addQuestion} className="flex-row items-center">
                <Ionicons name="add-circle" size={24} color="#2563EB" />
                <Text className="text-blue-600 font-semibold ml-1">Add</Text>
              </Pressable>
            </View>

            {questions.map((question, qIndex) => (
              <View key={question.id || qIndex} className="bg-gray-50 rounded-2xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-semibold text-gray-900">
                    Question {qIndex + 1}
                  </Text>
                  {questions.length > 1 && (
                    <Pressable onPress={() => removeQuestion(qIndex)}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </Pressable>
                  )}
                </View>

                {/* Question Text */}
                <TextInput
                  value={question.questionText}
                  onChangeText={(text) => updateQuestion(qIndex, "questionText", text)}
                  placeholder="Enter question text"
                  multiline
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-3"
                />

                {/* Question Type */}
                <View className="flex-row gap-2 mb-3">
                  {(["mcq", "true_false", "short_answer"] as const).map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => {
                        updateQuestion(qIndex, "questionType", type);
                        if (type === "true_false") {
                          updateQuestion(qIndex, "options", ["True", "False"]);
                        }
                      }}
                      className={`flex-1 py-2 rounded-lg ${
                        question.questionType === type ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-center text-xs font-medium ${
                          question.questionType === type ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {type === "mcq"
                          ? "MCQ"
                          : type === "true_false"
                            ? "True/False"
                            : "Short Answer"}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Options */}
                {question.questionType !== "short_answer" && (
                  <View className="mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-medium text-gray-700">Options</Text>
                      {question.questionType === "mcq" && question.options.length < 6 && (
                        <Pressable onPress={() => addOption(qIndex)}>
                          <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
                        </Pressable>
                      )}
                    </View>
                    {question.options.map((option, oIndex) => (
                      <View key={oIndex} className="flex-row items-center mb-2">
                        <TextInput
                          value={option}
                          onChangeText={(text) => updateOption(qIndex, oIndex, text)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          editable={question.questionType !== "true_false"}
                        />
                        {question.questionType === "mcq" && question.options.length > 2 && (
                          <Pressable
                            onPress={() => removeOption(qIndex, oIndex)}
                            className="ml-2"
                          >
                            <Ionicons name="close-circle" size={20} color="#EF4444" />
                          </Pressable>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Correct Answer */}
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Correct Answer</Text>
                  <TextInput
                    value={question.correctAnswer}
                    onChangeText={(text) => updateQuestion(qIndex, "correctAnswer", text)}
                    placeholder="Enter correct answer"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </View>

                {/* Points */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Points</Text>
                  <TextInput
                    value={question.points.toString()}
                    onChangeText={(text) =>
                      updateQuestion(qIndex, "points", Number.parseInt(text, 10) || 1)
                    }
                    placeholder="1"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={createQuiz.isPending}
            className={`py-4 rounded-xl items-center ${
              createQuiz.isPending ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            {createQuiz.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-base">Create Quiz</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
