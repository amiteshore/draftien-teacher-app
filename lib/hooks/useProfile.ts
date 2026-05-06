import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
};

type TeacherProfile = {
  id: string;
  userId: string;
  subjects: string[];
  experience: number | null;
  resumeUrl: string | null;
  examSpecialization: string | null;
  status: string;
  createdAt: string;
};

type UserProfile = {
  id: string;
  email: string;
  name: string;
  mobileNumber: string | null;
  notificationToken: string | null;
  role: "teacher" | "student" | null;
  isOnboarded: boolean;
  isVerified: boolean;
  isActive: boolean;
  profile?: TeacherProfile | null;
};

// Get current user profile
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: UserProfile;
      }>("/users/me");
      return response.data.data;
    },
  });
}

// Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      mobileNumber?: string;
      notificationToken?: string;
    }) => {
      const response = await api.patch<{
        success: boolean;
        data: UserProfile;
      }>("/users/me", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

// Update teacher profile
export function useUpdateTeacherProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      subjects?: string[];
      experience?: number;
      resumeUrl?: string;
      examSpecialization?: string;
    }) => {
      const response = await api.patch<{
        success: boolean;
        data: {
          role: "teacher";
          profile: TeacherProfile;
        };
      }>("/users/profile", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}
