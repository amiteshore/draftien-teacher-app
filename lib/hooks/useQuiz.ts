import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface QuizQuestion {
  id?: string;
  questionText: string;
  questionType: "mcq" | "true_false" | "short_answer";
  options: string[];
  correctAnswer: string;
  points: number;
  orderIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  description: string | null;
  durationMinutes: number;
  passingScore: number;
  maxAttempts: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
  attemptsUsed?: number;
  attemptsRemaining?: number;
}

export interface CreateQuizInput {
  courseId: string;
  lessonId?: string;
  title: string;
  description?: string;
  durationMinutes: number;
  passingScore: number;
  maxAttempts: number;
  questions: QuizQuestion[];
}

export interface UpdateQuizInput {
  title?: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  isPublished?: boolean;
}

// Get quizzes by course ID
export function useQuizzesByCourse(courseId: string) {
  return useQuery<{ success: boolean; data: Quiz[] }>({
    queryKey: ["quizzes", courseId],
    queryFn: async () => {
      const response = await api.get(`/quiz/course/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });
}

// Get single quiz details
export function useQuiz(quizId: string) {
  return useQuery<{ success: boolean; data: Quiz }>({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const response = await api.get(`/quiz/detail/${quizId}`);
      return response.data;
    },
    enabled: !!quizId,
  });
}

// Create quiz
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuizInput) => {
      const response = await api.post("/quiz", input);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", variables.courseId] });
    },
  });
}

// Update quiz
export function useUpdateQuiz(quizId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateQuizInput) => {
      const response = await api.patch(`/quiz/${quizId}`, input);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes", courseId] });
    },
  });
}

// Delete quiz
export function useDeleteQuiz(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      const response = await api.delete(`/quiz/${quizId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", courseId] });
    },
  });
}
