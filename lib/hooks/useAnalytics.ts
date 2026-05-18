import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// ─────────────────────────────────────────────
// Types — mirrors analytics.service.ts exactly
// ─────────────────────────────────────────────

export type DashboardSummary = {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  avgCompletion: number;
};

export type DashboardCourse = {
  id: string;
  title: string;
  category: string | null;
  level: string;
  isPublished: boolean;
  price: number;
  enrolledStudents: number;
  avgProgress: number;
  completedStudents: number;
  lessonCount: number;
  lectureCount: number;
  quizCount: number;
  upcomingLiveClasses: number;
};

export type RecentEnrollment = {
  enrolledAt: string;
  studentId: string;
  studentName: string | null;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
};

export type QuizStat = {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  totalAttempts: number;
  uniqueStudents: number;
  avgScore: number;
  passCount: number;
  passRate: number;
};

export type UpcomingLiveClass = {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  platform: string;
  status: string;
  courseId: string;
  courseTitle: string;
  rsvpCount: number;
};

export type AtRiskStudent = {
  studentId: string;
  studentName: string | null;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  daysSinceEnrollment: number;
};

export type RecentQuizAttempt = {
  id: string;
  submittedAt: string;
  score: number;
  isPassed: boolean;
  studentId: string;
  studentName: string | null;
  quizId: string;
  quizTitle: string;
  courseId: string;
  courseTitle: string;
};

export type TeacherDashboard = {
  summary: DashboardSummary;
  courses: DashboardCourse[];
  recentEnrollments: RecentEnrollment[];
  quizStats: QuizStat[];
  upcomingLiveClasses: UpcomingLiveClass[];
  atRiskStudents: AtRiskStudent[];
  recentQuizAttempts: RecentQuizAttempt[];
};

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ["analytics", "teacher", "dashboard"],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: TeacherDashboard }>(
        "/analytics/teacher/dashboard",
      );
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
