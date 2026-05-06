import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courseKeys } from "./useCourses";

// Query Keys
export const lessonKeys = {
  all: ["lessons"] as const,
  lists: () => [...lessonKeys.all, "list"] as const,
  list: (courseId: string) => [...lessonKeys.lists(), courseId] as const,
  details: () => [...lessonKeys.all, "detail"] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
};

type Lesson = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  contentType: string;
  contentUrl: string | null;
  durationMinutes: number | null;
  orderIndex: number;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

// Get lessons by course ID
export function useLessons(courseId: string | undefined) {
  return useQuery({
    queryKey: lessonKeys.list(courseId || ""),
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const response = await api.get<{
        success: boolean;
        data: Lesson[];
      }>(`/lessons/${courseId}`);
      return response.data.data;
    },
    enabled: !!courseId,
  });
}

// Create lesson
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      courseId: string;
      title: string;
      description?: string;
      contentType: "video" | "pdf" | "text" | "quiz";
      contentUrl?: string;
      durationMinutes?: number;
      orderIndex?: number;
      isFree?: boolean;
    }) => {
      const response = await api.post<{
        success: boolean;
        data: Lesson;
      }>("/lessons", data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the lessons list for this course
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(variables.courseId) });
      // Also invalidate the course details to refresh lessons count
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
}

// Update lesson
export function useUpdateLesson(lessonId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      description?: string;
      contentType?: "video" | "pdf" | "text" | "quiz";
      contentUrl?: string;
      durationMinutes?: number;
      orderIndex?: number;
      isFree?: boolean;
      isPublished?: boolean;
    }) => {
      const response = await api.patch(`/lessons/${lessonId}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

// Delete lesson
export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      await api.delete(`/lessons/${lessonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}
