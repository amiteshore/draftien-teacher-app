import { api } from "@/lib/axios";
import { signOutFromGoogle } from "@/lib/googleLogin";
import {
  clearAuthData,
  getPendingEmail,
  getUser,
  removePendingEmail,
  savePendingEmail,
  saveToken,
  saveUser,
} from "@/lib/storage";
import { User } from "@/types/auth";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  pendingEmail: string | null;
  login: (email: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<User>;
  verifyOtp: (otp: string) => Promise<User>;
  resendOtp: () => Promise<void>;
  completeOnboarding: (data?: unknown) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type TeacherOnboardingPayload = {
  name: string;
  mobile: string;
  experience: string;
  examSpecialization: "JEE" | "NEET";
  subjects: string[];
};

type GetMeResponseData = {
  id: string;
  email: string;
  name: string;
  mobileNumber: string | null;
  role: "teacher" | "pending" | null;
  isOnboarded: boolean;
  isVerified: boolean;
};

type GoogleLoginResponseData = {
  id: string;
  email: string;
  name: string;
  mobileNumber: string | null;
  role: "teacher" | "pending" | null;
  isVerified: boolean;
  token: string;
};

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const [storedUser, storedPendingEmail] = await Promise.all([getUser(), getPendingEmail()]);
        setUser(storedUser);
        setPendingEmail(storedPendingEmail);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string) => {
    try {
      await api.post("/auth/login", { email });
      setPendingEmail(email);
      await savePendingEmail(email);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? "Unable to send OTP.");
      }
      throw new Error("Unable to send OTP.");
    }
  };

  const verifyOtp = async (otp: string) => {
    if (!pendingEmail) {
      throw new Error("Email not found. Please login again.");
    }

    try {
      const response = await api.post("/auth/verify-otp", {
        email: pendingEmail,
        otp,
      });

      const authData = response.data?.data;
      if (!authData?.token || !authData?.id) {
        throw new Error("Invalid auth response from server.");
      }
      await saveToken(authData.token);
      console.log(authData.token);

      const meResponse = await api.get("/users/me");
      const meData = meResponse.data?.data as GetMeResponseData | undefined;

      if (!meData?.id || !meData?.email) {
        throw new Error("Invalid profile response from server.");
      }

      // If role is pending or null, set it to teacher
      let userRole = meData.role;
      if (!meData.role || meData.role === "pending") {
        await api.patch("/users/profile", { role: "teacher" });
        userRole = "teacher";
      }

      const verifiedUser: User = {
        id: meData.id,
        email: meData.email,
        name: meData.name,
        mobileNumber: meData.mobileNumber,
        role: userRole,
        isVerified: meData.isVerified,
        isOnboarded: meData.isOnboarded,
      };

      setUser(verifiedUser);
      await saveUser(verifiedUser);
      setPendingEmail(null);
      await removePendingEmail();
      return verifiedUser;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? "OTP verification failed.");
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("OTP verification failed.");
    }
  };

  const googleLogin = async (idToken: string) => {
    try {
      const response = await api.post("/auth/google/login", { idToken });
      const authData = response.data?.data as GoogleLoginResponseData | undefined;

      if (!authData?.token || !authData?.id) {
        throw new Error("Invalid Google auth response from server.");
      }

      await saveToken(authData.token);

      const meResponse = await api.get("/users/me");
      const meData = meResponse.data?.data as GetMeResponseData | undefined;
      console.log("me data", meData);

      if (!meData?.id || !meData?.email) {
        throw new Error("Invalid profile response from server.");
      }

      // If role is pending or null, set it to teacher
      let userRole = meData.role;
      if (!meData.role || meData.role === "pending") {
        await api.patch("/users/profile", { role: "teacher" });
        userRole = "teacher";
      }
      console.log("userRole", userRole);

      const loggedInUser: User = {
        id: meData.id,
        email: meData.email,
        name: meData.name,
        mobileNumber: meData.mobileNumber,
        role: userRole,
        isVerified: meData.isVerified,
        isOnboarded: meData.isOnboarded,
      };

      setUser(loggedInUser);
      await saveUser(loggedInUser);
      setPendingEmail(null);
      await removePendingEmail();
      return loggedInUser;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? "Google login failed.");
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Google login failed.");
    }
  };

  const resendOtp = async () => {
    if (!pendingEmail) {
      throw new Error("Email not found. Please login again.");
    }
    try {
      await api.post("/auth/resend-otp", { email: pendingEmail });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? "Unable to resend OTP.");
      }
      throw new Error("Unable to resend OTP.");
    }
  };

  const completeOnboarding = async (data?: unknown) => {
    if (!user) {
      throw new Error("User session not found.");
    }

    try {
      const payload = data as TeacherOnboardingPayload;

      await api.patch("/users/me", {
        name: payload.name,
        mobileNumber: payload.mobile,
      });

      await api.patch("/users/profile", {
        subjects: payload.subjects,
        experience: Number(payload.experience),
        examSpecialization: payload.examSpecialization,
      });

      const updatedUser = { ...user, isOnboarded: true };
      setUser(updatedUser);
      await saveUser(updatedUser);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? "Unable to complete onboarding.");
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unable to complete onboarding.");
    }
  };

  const logout = async () => {
    await signOutFromGoogle();
    await clearAuthData();
    queryClient.clear();
    setUser(null);
    setPendingEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pendingEmail,
        login,
        googleLogin,
        verifyOtp,
        resendOtp,
        completeOnboarding,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
