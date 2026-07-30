import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type TimetableItem = {
  id: string;
  courseId: string;
  courseTitle: string;
  lectureTitle: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  platform: string;
  isLive: boolean;
};

export function useWeeklyTimetable() {
  return useQuery({
    queryKey: ["timetable", "weekly"],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: TimetableItem[] }>(
        "/timetable/weekly",
      );
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
