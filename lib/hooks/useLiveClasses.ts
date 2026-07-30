import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface LiveClass {
  id: string;
  courseId: string;
  teacherId: string;
  teacherName: string;
  courseTitle: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  livekitRoomName: string;
  livekitUrl: string | null;
  status: "scheduled" | "live" | "completed" | "cancelled";
  recordingUrl: string | null;
  isCancelled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LiveClassesResponse {
  success: boolean;
  data: LiveClass[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLiveClassInput {
  courseId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  platform?: "inhouse" | "google_meet" | "zoom";
}

export interface UpdateLiveClassInput {
  title?: string;
  description?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  platform?: "inhouse" | "google_meet" | "zoom";
  status?: "scheduled" | "live" | "completed" | "cancelled";
}

export function useLiveClasses(
  courseId?: string,
  status?: "scheduled" | "live" | "completed" | "cancelled",
  page = 1,
  limit = 20,
) {
  return useQuery<LiveClassesResponse>({
    queryKey: ["liveClasses", courseId, status, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(courseId && { courseId }),
        ...(status && { status }),
      });
      const response = await api.get(`/live-class?${params}`);
      return response.data;
    },
  });
}

export function useUpcomingLiveClasses(limit = 10) {
  return useQuery<LiveClassesResponse>({
    queryKey: ["liveClasses", "upcoming", limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: "scheduled",
        limit: limit.toString(),
      });
      const response = await api.get(`/live-class?${params}`);
      return response.data;
    },
  });
}

export function useCreateLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLiveClassInput) => {
      const response = await api.post<{ success: boolean; data: LiveClass }>("/live-class", input);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["liveClasses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateLiveClass(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateLiveClassInput) => {
      const response = await api.patch<{ success: boolean; data: LiveClass }>(
        `/live-class/${id}`,
        input,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveClasses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useEndLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<{ success: boolean; data: LiveClass }>(`/live-class/${id}/end`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveClasses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteLiveClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/live-class/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liveClasses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
