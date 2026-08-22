import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { Pressable } from "react-native";

export default function Layout() {
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
          title: "My Courses",
        }}
      />
    </Stack>
  );
}
