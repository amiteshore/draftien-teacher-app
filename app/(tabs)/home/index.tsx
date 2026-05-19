import { useAuth } from "@/context/AuthContext";
import { useTeacherDashboard } from "@/lib/hooks/useAnalytics";
import { configureNotificationHandler, registerForPushNotificationsAsync } from "@/lib/notifications";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

configureNotificationHandler();

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

function getInitials(name?: string | null) {
  if (!name) return "T";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatScheduledAt(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  if (date.toDateString() === today.toDateString()) return `Today · ${time}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow · ${time}`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) + ` · ${time}`;
}

function formatEnrolledAt(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      <Text className="text-xs text-gray-500 mt-0.5">{label}</Text>
    </View>
  );
}

function SectionHeader({ title, onPress }: { title: string; onPress?: () => void }) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-base font-bold text-gray-900">{title}</Text>
      {onPress && (
        <Pressable onPress={onPress} hitSlop={8}>
          <Text className="text-sm font-semibold text-blue-600">See all</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, error, refetch, isRefetching } = useTeacherDashboard();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const summary = data?.summary;
  const courses = data?.courses ?? [];
  const recentEnrollments = data?.recentEnrollments ?? [];
  const upcomingLiveClasses = data?.upcomingLiveClasses ?? [];
  const atRiskStudents = data?.atRiskStudents ?? [];
  const quizStats = data?.quizStats ?? [];
  const recentQuizAttempts = data?.recentQuizAttempts ?? [];

  return (
    <ScrollView
      className="flex-1 bg-[#F6F8FC]"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />
      }
    >
      {/* ── Header ── */}
      <View className="bg-white px-5 pt-5 pb-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm text-gray-500">{getGreeting()}</Text>
            <Text className="text-2xl font-bold text-gray-900 mt-0.5">
              {user?.name || "Teacher"}
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center">
            <Text className="text-white text-base font-bold">{getInitials(user?.name)}</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center py-24">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-sm text-gray-500 mt-3">Loading dashboard…</Text>
        </View>
      ) : error ? (
        <View className="mx-4 mt-6 bg-white rounded-2xl p-6 items-center">
          <Ionicons name="cloud-offline-outline" size={40} color="#EF4444" />
          <Text className="text-base font-semibold text-gray-900 mt-3">Failed to load</Text>
          <Pressable onPress={() => refetch()} className="mt-4 bg-blue-600 px-6 py-2.5 rounded-xl">
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* ── Summary stats ── */}
          <View className="px-4 mt-4">
            <View className="flex-row gap-3 mb-3">
              <StatCard
                icon="book"
                iconBg="#DBEAFE"
                iconColor="#2563EB"
                value={summary?.totalCourses ?? 0}
                label="Total Courses"
              />
              <StatCard
                icon="people"
                iconBg="#D1FAE5"
                iconColor="#059669"
                value={summary?.totalStudents ?? 0}
                label="Total Students"
              />
            </View>
            <View className="flex-row gap-3">
              <StatCard
                icon="checkmark-circle"
                iconBg="#FEF3C7"
                iconColor="#D97706"
                value={summary?.publishedCourses ?? 0}
                label="Published"
              />
              <StatCard
                icon="trending-up"
                iconBg="#EDE9FE"
                iconColor="#7C3AED"
                value={`${(summary?.avgCompletion ?? 0).toFixed(1)}%`}
                label="Avg Completion"
              />
            </View>
          </View>

          {/* ── Upcoming live classes ── */}
          {upcomingLiveClasses.length > 0 && (
            <View className="px-4 mt-6">
              <SectionHeader title="Upcoming Live Classes" />
              {upcomingLiveClasses.map((lc) => (
                <View
                  key={lc.id}
                  className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 flex-row items-start"
                >
                  <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3 mt-0.5">
                    <Ionicons name="videocam" size={18} color="#EF4444" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                      {lc.title}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                      {lc.courseTitle}
                    </Text>
                    <View className="flex-row items-center mt-2 gap-3">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={13} color="#6B7280" />
                        <Text className="text-sm text-gray-500">
                          {formatScheduledAt(lc.scheduledAt)} · {lc.durationMinutes}m
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="person-outline" size={13} color="#6B7280" />
                        <Text className="text-sm text-gray-500">{lc.rsvpCount} RSVPs</Text>
                      </View>
                    </View>
                  </View>
                  <View className="px-2 py-1 rounded-full bg-red-50 ml-2">
                    <Text className="text-sm font-semibold text-red-600 capitalize">
                      {lc.platform}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Course breakdown ── */}
          {courses.length > 0 && (
            <View className="px-4 mt-6">
              <SectionHeader
                title="Course Overview"
                onPress={() => router.push("/(tabs)/courses")}
              />
              {courses.map((course) => (
                <Pressable
                  key={course.id}
                  onPress={() =>
                    router.push({ pathname: "/(tabs)/courses/details", params: { id: course.id } })
                  }
                  className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <Text
                      className="text-base font-semibold text-gray-900 flex-1 mr-2"
                      numberOfLines={1}
                    >
                      {course.title}
                    </Text>
                    <View
                      className={`px-2 py-0.5 rounded-full ${course.isPublished ? "bg-green-100" : "bg-yellow-100"}`}
                    >
                      <Text
                        className={`text-sm font-medium ${course.isPublished ? "text-green-700" : "text-yellow-700"}`}
                      >
                        {course.isPublished ? "Live" : "Draft"}
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View className="h-1.5 bg-gray-100 rounded-full mb-2">
                    <View
                      className="h-1.5 bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(course.avgProgress, 100)}%` }}
                    />
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="people-outline" size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-500">{course.enrolledStudents} students</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="book-outline" size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-500">{course.lessonCount} lessons</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="help-circle-outline" size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-500">{course.quizCount} quizzes</Text>
                    </View>
                    <Text className="text-sm text-blue-600 font-semibold ml-auto">
                      {course.avgProgress.toFixed(0)}% avg
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── Recent enrollments ── */}
          {recentEnrollments.length > 0 && (
            <View className="px-4 mt-6">
              <SectionHeader title="Recent Enrollments" />
              <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {recentEnrollments.slice(0, 5).map((e, i) => (
                  <View
                    key={`${e.studentId}-${e.courseId}`}
                    className={`flex-row items-center px-4 py-3 ${i < 4 ? "border-b border-gray-50" : ""}`}
                  >
                    <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                      <Text className="text-xs font-bold text-blue-600">
                        {getInitials(e.studentName)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                        {e.studentName || e.studentEmail}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                        {e.courseTitle}
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-400">{formatEnrolledAt(e.enrolledAt)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Quiz health ── */}
          {quizStats.length > 0 && (
            <View className="px-4 mt-6">
              <SectionHeader title="Quiz Performance" />
              <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {quizStats.slice(0, 4).map((q, i) => (
                  <View
                    key={q.id}
                    className={`px-4 py-3 ${i < Math.min(quizStats.length, 4) - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>
                        {q.title}
                      </Text>
                      <Text className="text-sm text-gray-500">{q.totalAttempts} attempts</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-1 h-1.5 bg-gray-100 rounded-full">
                        <View
                          className="h-1.5 bg-purple-500 rounded-full"
                          style={{ width: `${Math.min(q.passRate, 100)}%` }}
                        />
                      </View>
                      <Text className="text-sm font-semibold text-purple-600 w-14 text-right">
                        {q.passRate.toFixed(0)}% pass
                      </Text>
                    </View>
                    <Text className="text-sm text-gray-400 mt-0.5">{q.courseTitle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── At-risk students ── */}
          {atRiskStudents.length > 0 && (
            <View className="px-4 mt-6">
              <SectionHeader title="At-Risk Students" />
              <View className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
                <View className="flex-row items-center gap-2 px-4 py-2.5 bg-orange-50 border-b border-orange-100">
                  <Ionicons name="warning-outline" size={14} color="#D97706" />
                  <Text className="text-xs text-orange-700 font-medium">
                    Enrolled 7+ days · 0% progress
                  </Text>
                </View>
                {atRiskStudents.slice(0, 5).map((s, i) => (
                  <View
                    key={`${s.studentId}-${s.courseId}`}
                    className={`flex-row items-center px-4 py-3 ${i < 4 ? "border-b border-gray-50" : ""}`}
                  >
                    <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                      <Text className="text-xs font-bold text-orange-600">
                        {getInitials(s.studentName)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                        {s.studentName || s.studentEmail}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                        {s.courseTitle}
                      </Text>
                    </View>
                    <View className="px-2 py-1 rounded-full bg-orange-100">
                      <Text className="text-xs font-semibold text-orange-700">
                        {s.daysSinceEnrollment}d
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Recent quiz attempts ── */}
          {recentQuizAttempts.length > 0 && (
            <View className="px-4 mt-6">
              <SectionHeader title="Recent Quiz Attempts" />
              <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {recentQuizAttempts.slice(0, 5).map((a, i) => (
                  <View
                    key={a.id}
                    className={`flex-row items-center px-4 py-3 ${i < 4 ? "border-b border-gray-50" : ""}`}
                  >
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${a.isPassed ? "bg-green-100" : "bg-red-100"}`}
                    >
                      <Ionicons
                        name={a.isPassed ? "checkmark" : "close"}
                        size={16}
                        color={a.isPassed ? "#059669" : "#EF4444"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                        {a.studentName || "Student"}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                        {a.quizTitle} · {a.courseTitle}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-bold ${a.isPassed ? "text-green-600" : "text-red-500"}`}
                    >
                      {a.score.toFixed(0)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Empty state ── */}
          {courses.length === 0 && (
            <View className="mx-4 mt-6 bg-white rounded-2xl p-8 items-center border border-gray-100">
              <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
                <Ionicons name="book-outline" size={32} color="#2563EB" />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-1">No courses yet</Text>
              <Text className="text-sm text-gray-500 text-center mb-5">
                Create your first course to start teaching
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/courses/course-form")}
                className="bg-blue-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Create Course</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
