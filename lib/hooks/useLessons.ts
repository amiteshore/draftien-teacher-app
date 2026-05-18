import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courseKeys } from "./useCourses";

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────

export const lessonKeys = {
  all: ["lessons"] as const,
  lists: () => [...lessonKeys.all, "list"] as const,
  list: (courseId: string) => [...lessonKeys.lists(), courseId] as const,
  details: () => [...lessonKeys.all, "detail"] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
};

export const lectureKeys = {
  all: ["lectures"] as const,
  lists: () => [...lectureKeys.all, "list"] as const,
  list: (lessonId: string) => [...lectureKeys.lists(), lessonId] as const,
  details: () => [...lectureKeys.all, "detail"] as const,
  detail: (id: string) => [...lectureKeys.details(), id] as const,
};

export const noteKeys = {
  all: ["lecture-notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (lectureId: string) => [...noteKeys.lists(), lectureId] as const,
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type LectureNote = {
  id: string;
  lectureId: string;
  title: string;
  contentUrl: string | null;
  content: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type Lecture = {
  id: string;
  lessonId: string;
  title: string;
  type: "video" | "pdf";
  contentUrl: string | null;
  durationMinutes: number | null;
  orderIndex: number;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  notes: LectureNote[];
};

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  orderIndex: number;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  lectures: Lecture[];
};

// ─────────────────────────────────────────────
// Sort helper
// ─────────────────────────────────────────────

function byOrderIndex<T extends { orderIndex: number }>(a: T, b: T) {
  return a.orderIndex - b.orderIndex;
}

function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons]
    .sort(byOrderIndex)
    .map((lesson) => ({
      ...lesson,
      lectures: [...lesson.lectures]
        .sort(byOrderIndex)
        .map((lecture) => ({
          ...lecture,
          notes: [...lecture.notes].sort(byOrderIndex),
        })),
    }));
}

// ─────────────────────────────────────────────
// Lessons
// ─────────────────────────────────────────────

export function useLessons(courseId: string | undefined) {
  return useQuery({
    queryKey: lessonKeys.list(courseId || ""),
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const response = await api.get<{ success: boolean; data: Lesson[] }>(
        `/lessons/course/${courseId}`,
      );
      return response.data.data;
    },
    select: sortLessons,
    enabled: !!courseId,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      courseId: string;
      title: string;
      description?: string;
      orderIndex?: number;
      isFree?: boolean;
    }) => {
      const response = await api.post<{ success: boolean; data: Lesson }>("/lessons", data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) });
    },
  });
}

export function useUpdateLesson(lessonId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      description?: string;
      orderIndex?: number;
      isFree?: boolean;
      isPublished?: boolean;
    }) => {
      const response = await api.patch<{ success: boolean; data: Lesson }>(
        `/lessons/${lessonId}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    },
  });
}

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

// ─────────────────────────────────────────────
// Lectures
// ─────────────────────────────────────────────

export function useLectures(lessonId: string | undefined) {
  return useQuery({
    queryKey: lectureKeys.list(lessonId || ""),
    queryFn: async () => {
      if (!lessonId) throw new Error("Lesson ID is required");
      const response = await api.get<{ success: boolean; data: Lecture[] }>(
        `/lessons/${lessonId}/lectures`,
      );
      return response.data.data;
    },
    enabled: !!lessonId,
  });
}

export function useCreateLecture(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      lessonId: string;
      title: string;
      type: "video" | "pdf";
      contentUrl?: string;
      durationMinutes?: number;
      orderIndex?: number;
      isFree?: boolean;
    }) => {
      const { lessonId, ...body } = data;
      const response = await api.post<{ success: boolean; data: Lecture }>(
        `/lessons/${lessonId}/lectures`,
        body,
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.list(variables.lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(courseId) });
    },
  });
}

export function useUpdateLecture(lectureId: string, lessonId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      type?: "video" | "pdf";
      contentUrl?: string;
      durationMinutes?: number;
      orderIndex?: number;
      isFree?: boolean;
      isPublished?: boolean;
    }) => {
      const response = await api.patch<{ success: boolean; data: Lecture }>(
        `/lessons/lectures/${lectureId}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.list(lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(courseId) });
    },
  });
}

export function useDeleteLecture(lessonId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lectureId: string) => {
      await api.delete(`/lessons/lectures/${lectureId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lectureKeys.list(lessonId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(courseId) });
    },
  });
}

// ─────────────────────────────────────────────
// Lecture Notes
// ─────────────────────────────────────────────

export function useLectureNotes(lectureId: string | undefined) {
  return useQuery({
    queryKey: noteKeys.list(lectureId || ""),
    queryFn: async () => {
      if (!lectureId) throw new Error("Lecture ID is required");
      const response = await api.get<{ success: boolean; data: LectureNote[] }>(
        `/lessons/lectures/${lectureId}/notes`,
      );
      return response.data.data;
    },
    enabled: !!lectureId,
  });
}

export function useCreateLectureNote(lectureId: string, lessonId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      contentUrl?: string;
      content?: string;
      orderIndex?: number;
    }) => {
      const response = await api.post<{ success: boolean; data: LectureNote }>(
        `/lessons/lectures/${lectureId}/notes`,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(lectureId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(courseId) });
    },
  });
}

export function useUpdateLectureNote(
  noteId: string,
  lectureId: string,
  lessonId: string,
  courseId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      contentUrl?: string;
      content?: string;
      orderIndex?: number;
    }) => {
      const response = await api.patch<{ success: boolean; data: LectureNote }>(
        `/lessons/lectures/notes/${noteId}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(lectureId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(courseId) });
    },
  });
}

export function useDeleteLectureNote(lectureId: string, lessonId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/lessons/lectures/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.list(lectureId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.list(courseId) });
    },
  });
}
