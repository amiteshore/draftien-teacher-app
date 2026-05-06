import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function OtpScreen() {
  const { pendingEmail, resendOtp, verifyOtp } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const verifiedUser = await verifyOtp(otp);

      if (!verifiedUser?.role) {
        router.replace("/(onboarding)/teacher");
      } else if (!verifiedUser.isOnboarded) {
        router.replace("/(onboarding)/teacher");
      } else {
        router.replace("/");
      }
    } catch (error) {
      Alert.alert(
        "Verification Failed",
        error instanceof Error ? error.message : "Unable to verify OTP.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      await resendOtp();
      Alert.alert("OTP Sent", "A new OTP has been sent to your email.");
    } catch (error) {
      Alert.alert(
        "Resend Failed",
        error instanceof Error ? error.message : "Unable to resend OTP.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1 bg-white px-6"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 justify-center">
          {/* Header */}
          <Text className="text-3xl font-bold text-gray-900">Verify OTP</Text>
          <Text className="mt-2 text-base text-gray-500">
            Enter the 6-digit code sent to {pendingEmail ?? "your email"}.
          </Text>

          {/* OTP Input */}
          <TextInput
            className="mt-8 rounded-xl border border-gray-300 px-4 py-4 text-center text-xl tracking-[8px]"
            keyboardType="number-pad"
            maxLength={6}
            placeholder="------"
            placeholderTextColor="#9CA3AF"
            value={otp}
            onChangeText={setOtp}
          />

          {/* Verify Button */}
          <Pressable
            onPress={handleVerifyOtp}
            disabled={loading}
            className={`mt-6 items-center rounded-xl py-4 ${
              loading ? "bg-indigo-400" : "bg-indigo-600"
            }`}
          >
            <Text className="text-base font-semibold text-white">
              {loading ? "Verifying..." : "Verify OTP"}
            </Text>
          </Pressable>

          {/* Resend OTP */}
          <Pressable onPress={handleResendOtp} disabled={resending} className="mt-4 items-center">
            <Text className="text-sm font-medium text-indigo-600">
              {resending ? "Resending..." : "Resend OTP"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
