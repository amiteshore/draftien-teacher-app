import { useAuth } from "@/context/AuthContext";
import { signInWithGoogle } from "@/lib/googleLogin";
// import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Linking,
	Platform,
	Pressable,
	Text,
	TextInput,
	TouchableWithoutFeedback,
	View,
} from "react-native";

export default function LoginScreen() {
	const { googleLogin, login } = useAuth();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	const handleContinue = async () => {
		if (!email.trim()) {
			Alert.alert("Email Required", "Please enter your email address.");
			return;
		}

		// Basic email validation
		const emailRegex = /^\S+@\S+\.\S+$/;
		if (!emailRegex.test(email)) {
			Alert.alert("Invalid Email", "Please enter a valid email address.");
			return;
		}

		try {
			setLoading(true);
			await login(email.trim().toLowerCase());
			router.push("/(auth)/otp");
		} catch (error) {
			Alert.alert(
				"Login Failed",
				error instanceof Error ? error.message : "Unable to send OTP.",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		try {
			setGoogleLoading(true);
			const idToken = await signInWithGoogle();
			if (!idToken) {
				return;
			}
			await googleLogin(idToken);
			router.replace("/");
		} catch (error) {
			Alert.alert(
				"Google Login Failed",
				error instanceof Error ? error.message : "Unable to login.",
			);
		} finally {
			setGoogleLoading(false);
		}
	};

	// const handleAppleLogin = () => {
	//   Alert.alert("Apple Login", "Apple login coming soon.");
	// };

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView
				className="flex-1 bg-white px-6"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				{/* Header */}
				<View className="flex-1 justify-center">
					<Image
						source={require("@/assets/logo.png")}
						className="mb-6 h-28 w-28"
						resizeMode="contain"
					/>
					<Text className="text-4xl font-bold text-[#01196f]">Welcome to</Text>
					<Text className="text-5xl font-bold text-[#01196f]">
						Draftien Teacher
					</Text>
					<Text className="mt-2 text-base text-gray-500">
						Continue your teaching journey
					</Text>

					{/* Email Input */}
					<View className="mt-10">
						<Text className="mb-2 text-sm font-medium text-gray-700">
							Email Address
						</Text>
						<TextInput
							placeholder="Enter your email"
							placeholderTextColor="#9CA3AF"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							value={email}
							onChangeText={setEmail}
							className="w-full rounded-xl border border-gray-300 px-4 py-4 text-base text-gray-900"
						/>
					</View>

					{/* Continue Button */}
					<Pressable
						onPress={handleContinue}
						disabled={loading}
						className={`mt-6 items-center rounded-xl py-4 ${loading ? "bg-[#02a7fc]/70" : "bg-[#02a7fc]"}`}
					>
						<Text className="text-base font-semibold text-white">
							{loading ? "Sending OTP..." : "Continue"}
						</Text>
					</Pressable>

					{/* Divider */}
					<View className="my-8 flex-row items-center">
						<View className="h-px flex-1 bg-gray-300" />
						<Text className="mx-3 text-sm text-gray-500">OR</Text>
						<View className="h-px flex-1 bg-gray-300" />
					</View>

					{/* Google Sign-In Button */}
					<Pressable
						onPress={handleGoogleLogin}
						disabled={googleLoading}
						className="flex-row items-center justify-center rounded-xl border border-gray-300 py-4"
					>
						<Image
							source={require("@/assets/images/google.png")}
							className="mr-3 h-5 w-5"
							resizeMode="contain"
						/>
						<Text className="text-base font-medium text-gray-800">
							{googleLoading ? "Signing in..." : "Continue with Google"}
						</Text>
					</Pressable>

					{/* <Pressable
            onPress={handleAppleLogin}
            className="mt-4 flex-row items-center justify-center rounded-xl border border-gray-300 py-4"
          >
            <Ionicons name="logo-apple" size={20} color="#1F2937" />
            <Text className="ml-3 text-base font-medium text-gray-800">Continue with Apple</Text>
          </Pressable> */}
				</View>

				{/* Footer */}
				<View className="pb-6 flex-row flex-wrap justify-center items-center">
					<Text className="text-center text-xs text-gray-400">
						By continuing, you agree to our{" "}
					</Text>
					<Pressable
						onPress={() => Linking.openURL("https://draftien.com/terms")}
					>
						<Text className="text-xs text-[#01196f] font-medium">Terms</Text>
					</Pressable>
					<Text className="text-center text-xs text-gray-400"> & </Text>
					<Pressable
						onPress={() => Linking.openURL("https://draftien.com/privacy-policy")}
					>
						<Text className="text-xs text-[#01196f] font-medium">
							Privacy Policy
						</Text>
					</Pressable>
					<Text className="text-center text-xs text-gray-400">.</Text>
				</View>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
}
