import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function HomeLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Home",
          headerRight: () => (
            <Pressable onPress={() => router.push("/(tabs)/home/notifications")}>
              <Ionicons name="notifications-outline" size={24} color="#1A1A2E" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
        }}
      />
    </Stack>
  );
}
