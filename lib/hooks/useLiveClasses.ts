import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

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
