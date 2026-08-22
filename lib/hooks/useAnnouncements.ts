import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AnnouncementAttachment {
  id: string;
  announcementId: string;
  title: string;
  fileUrl: string;
  attachmentType: string;
  fileSize: number | null;
  createdAt: string;
}

export interface Announcement {
  id: string;
  teacherId: string;
  teacherName?: string | null;
  courseId: string;
  courseTitle?: string | null;
  title: string;
  content: string;
  publishAt: string | null;
  targetingType: "all" | "course" | "students";
  createdAt: string;
  updatedAt: string;
  attachments?: AnnouncementAttachment[];
}

export interface CreateAnnouncementInput {
  courseId: string;
  title: string;
  message: string;
  publishAt?: string;
  targetingType?: "all" | "course" | "students";
}

export function useAnnouncements(courseId: string | undefined) {
  return useQuery<{ success: boolean; data: Announcement[] }>({
    queryKey: ["announcements", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const response = await api.get(`/announcements/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAnnouncementInput) => {
      const { message, ...restBody } = input;
      const body = {
        ...restBody,
        content: message,
      };
      const response = await api.post<{ success: boolean; data: Announcement }>("/announcements", body);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["announcements", variables.courseId] });
    },
  });
}

export function useDeleteAnnouncement(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await api.delete(`/announcements/${announcementId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", courseId] });
    },
  });
}
