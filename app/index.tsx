import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();

  // Show loader while checking authentication state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // User not logged in → Auth flow
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Role not set or onboarding incomplete
  if (!user.role || !user.isOnboarded) {
    return <Redirect href="/(onboarding)/teacher" />;
  }

  // Fully onboarded teacher
  if (user.role === "teacher") {
    return <Redirect href="/(tabs)/home" />;
  }

  // Fallback
  return <Redirect href="/(auth)/login" />;
}
