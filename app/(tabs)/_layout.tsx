import { TabBarIcon } from "@/components/ui/TabBarIcon";
import { useAuth } from "@/context/AuthContext";
import { Redirect, Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TeacherTabLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== "teacher") {
    return <Redirect href="/(auth)/login" />;
  }

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
          height: Platform.OS === "ios" ? 74 : 66,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0.5,

          elevation: 0,
          shadowColor: "#0F172A",
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 20,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 16 : 8,
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
