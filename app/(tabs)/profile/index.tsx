import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";
import { useProfile } from "@/lib/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View, RefreshControl } from "react-native";

export default function YouScreen() {
  const { logout } = useAuth();
  const { data: profile, isLoading, error, refetch, isRefetching } = useProfile();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/teachers/profile/me");
              await logout();
              router.replace("/(auth)/login");
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.message || "Failed to process request. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (!profile?.name) return "T";

    const names = profile.name.trim().split(" ");

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F6F8FC] items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 bg-[#F6F8FC] items-center justify-center px-6">
        <Text className="text-red-600 text-center mb-4">Failed to load profile</Text>

        <Pressable onPress={() => refetch()} className="bg-blue-600 px-5 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-[#fff]"
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#2563EB" />}
    >
      {/* PROFILE CARD */}
      <View className="bg-white rounded-3xl p-5 border border-[#EEF2FF] overflow-hidden">
        {/* Background Decoration */}
        <View className="absolute -right-16 -top-10 w-44 h-44 rounded-full bg-blue-50 opacity-60" />
        <View className="absolute -right-24 top-28 w-52 h-52 rounded-full bg-indigo-50 opacity-40" />

        {/* USER INFO */}
        <View className="flex-row items-center">
          {/* AVATAR */}
          <View className="w-[68px] h-[68px] rounded-full bg-blue-600 items-center justify-center">
            <Text className="text-white text-2xl font-bold">{getInitials()}</Text>
          </View>

          {/* DETAILS */}
          <View className="flex-1 ml-4">
            <View className="flex-row items-center">
              <Text numberOfLines={1} className="text-[22px] font-bold text-slate-900">
                {profile.name || "Not Set"}
              </Text>

              {profile.isVerified && (
                <View className="ml-2 w-5 h-5 rounded-full bg-blue-600 items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Text numberOfLines={1} className="text-[15px] text-slate-500 mt-1">
              {profile.email}
            </Text>
          </View>
        </View>

        {/* APPROVAL */}
        {profile.role === "teacher" && profile.profile?.status === "pending" && (
          <View className="mt-5 bg-[#FFFBEA] border border-[#F6D76E] rounded-2xl px-4 py-3 flex-row">
            <Ionicons name="hourglass-outline" size={18} color="#D97706" />

            <View className="flex-1 ml-3">
              <Text className="text-[#92400E] font-semibold text-[14px]">
                Your profile is pending approval
              </Text>

              <Text className="text-[#A16207] text-[13px] mt-1">
                We’ll notify you once it’s approved.
              </Text>
            </View>
          </View>
        )}

        {/* INFO */}
        <View className="mt-5 pt-5 border-t border-slate-100">
          <View className="flex-row">
            {/* MOBILE */}
            <View className="flex-1 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-[#EEF4FF] items-center justify-center">
                <Ionicons name="call-outline" size={20} color="#2563EB" />
              </View>

              <View className="ml-3">
                <Text className="text-[13px] text-slate-500">Mobile</Text>

                <Text className="text-[16px] font-semibold text-slate-900 mt-1">
                  {profile.mobileNumber || "N/A"}
                </Text>
              </View>
            </View>

            {/* STATUS */}
            <View className="pl-4 border-l border-slate-100 justify-center">
              <Text className="text-[13px] text-slate-500">Status</Text>

              <View className="flex-row items-center mt-1">
                <View
                  className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    profile.isActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                />

                <Text className="text-[15px] font-semibold text-slate-900">
                  {profile.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* TEACHER PROFILE */}
      {profile.role === "teacher" && profile.profile && (
        <>
          {/* TITLE */}
          <View className="flex-row items-center mt-7 mb-4">
            <Ionicons name="person-outline" size={20} color="#2563EB" />

            <Text className="ml-2 text-[20px] font-bold text-slate-900">Teacher Profile</Text>
          </View>

          {/* CARD */}
          <View className="bg-white rounded-3xl border border-[#EEF2FF] overflow-hidden">
            {/* SUBJECTS */}
            <View className="p-4 flex-row">
              <View className="w-12 h-12 rounded-2xl bg-[#EEF4FF] items-center justify-center">
                <Ionicons name="book-outline" size={20} color="#2563EB" />
              </View>

              <View className="flex-1 ml-3">
                <Text className="text-[13px] text-slate-500">Subjects</Text>

                <View className="flex-row flex-wrap mt-2">
                  {profile.profile.subjects?.map((subject, index) => (
                    <View key={index} className="bg-blue-100 px-3 py-1.5 rounded-full mr-2 mb-2">
                      <Text className="text-[13px] font-medium text-blue-700">{subject}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* EXPERIENCE */}
            <View className="border-t border-slate-100 p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-[#EEF4FF] items-center justify-center">
                <Ionicons name="briefcase-outline" size={20} color="#2563EB" />
              </View>

              <View className="flex-1 ml-3">
                <Text className="text-[13px] text-slate-500">Experience</Text>

                <Text className="text-[16px] font-semibold text-slate-900 mt-1">
                  {profile.profile.experience || 0} years
                </Text>
              </View>
            </View>

            {/* SPECIALIZATION */}
            <View className="border-t border-slate-100 p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-[#EEF4FF] items-center justify-center">
                <Ionicons name="school-outline" size={20} color="#2563EB" />
              </View>

              <View className="flex-1 ml-3">
                <Text className="text-[13px] text-slate-500">Specialization</Text>

                <Text className="text-[16px] font-semibold text-slate-900 mt-1">
                  {profile.profile.examSpecialization || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* BUTTONS */}
      <View className="mt-7">
        {/* EDIT */}
        <Pressable
          onPress={() => router.push("/(tabs)/profile/edit-profile")}
          className="bg-blue-600 rounded-2xl py-4 items-center justify-center"
        >
          <View className="flex-row items-center">
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />

            <Text className="text-white text-[16px] font-semibold ml-2">Edit Profile</Text>
          </View>
        </Pressable>

        {/* LOGOUT */}
        <Pressable
          onPress={handleLogout}
          className="mt-4 bg-white border border-red-500 rounded-2xl py-4 items-center justify-center"
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />

            <Text className="text-red-500 text-[16px] font-semibold ml-2">Logout</Text>
          </View>
        </Pressable>

        {/* DELETE ACCOUNT */}
        <Pressable
          onPress={handleDeleteAccount}
          className="mt-4 mb-8 bg-red-50 border border-red-500 rounded-2xl py-4 items-center justify-center"
        >
          <View className="flex-row items-center">
            <Ionicons name="trash-outline" size={18} color="#EF4444" />

            <Text className="text-red-600 text-[16px] font-semibold ml-2">Delete Account</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
