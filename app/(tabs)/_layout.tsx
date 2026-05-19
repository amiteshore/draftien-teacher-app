import { TabBarIcon } from "@/components/ui/TabBarIcon";
import { useAuth } from "@/context/AuthContext";
import { Redirect, Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TeacherTabLayout() {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) return null;

  if (!user || user.role !== "teacher") {
    return <Redirect href="/(auth)/login" />;
  }

  const bottomPadding = Platform.OS === "ios" ? insets.bottom : insets.bottom + 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#101411",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarStyle: {
          height: 56 + bottomPadding,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0.5,
          elevation: 0,
          shadowColor: "#0F172A",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
          paddingTop: 8,
          paddingBottom: bottomPadding,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="home-outline" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="book-outline" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
