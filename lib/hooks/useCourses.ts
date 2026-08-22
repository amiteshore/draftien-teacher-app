import { api } from "@/lib/axios";
import type { Course, MyCoursesApiResponse } from "@/types/course";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (filters?: string) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

export type CourseCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type EnrolledStudent = {
  id: string;
  name: string | null;
  email: string;
  enrolledAt: string;
  progressPercentage: number;
  lastAccessedAt: string | null;
};

export type CourseStudentsResponse = {
  success: boolean;
  data: EnrolledStudent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Get students enrolled in a specific course
export function useCourseStudents(courseId: string | undefined, page = 1, limit = 50) {
  return useQuery<CourseStudentsResponse>({
    queryKey: ["course-students", courseId, page, limit],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const response = await api.get<CourseStudentsResponse>(
        `/courses/${courseId}/students?page=${page}&limit=${limit}`,
      );
      return response.data;
    },
    enabled: !!courseId,
  });
}

// Get all course categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: CourseCategory[] }>("/courses/categories");
      return response.data.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Get all courses for the current teacher
export function useCourses() {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: async () => {
      const response = await api.get<MyCoursesApiResponse>("/courses/my");
      return response.data.data || [];
    },
  });
}

// Get single course details
export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: courseKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) throw new Error("Course ID is required");
      const response = await api.get<{
        success: boolean;
        data: Course & {
          lessons?: Array<{
            id: string;
            title: string;
            description: string | null;
            contentType: string;
            contentUrl: string | null;
            durationMinutes: number | null;
            orderIndex: number;
            isFree: boolean;
            isPublished: boolean;
          }>;
          progress?: {
            percentage: number;
            lastAccessedAt: string;
          } | null;
        };
      }>(`/courses/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// Create course
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      thumbnailUrl?: string;
      category?: string;
      price?: number;
      durationHours?: number;
      level?: string;
    }) => {
      const response = await api.post<{ success: boolean; data: Course }>("/courses", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

// Update course
export function useUpdateCourse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      description?: string;
      thumbnailUrl?: string;
      category?: string;
      price?: number;
      durationHours?: number;
      level?: string;
      isPublished?: boolean;
    }) => {
      const response = await api.patch<{ success: boolean; data: Course }>(`/courses/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

// Delete course
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}
