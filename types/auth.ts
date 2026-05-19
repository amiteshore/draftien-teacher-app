export type User = {
  id: string;
  email: string;
  name?: string;
  mobileNumber?: string | null;
  role?: "teacher" | "pending" | null;
  isVerified?: boolean;
  isOnboarded?: boolean;
  notificationToken?: string | null;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
};
