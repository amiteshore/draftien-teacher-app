import { api } from "@/lib/axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const NOTIFICATION_TOKEN_KEY = "draftien_push_token_sent";
const EAS_PROJECT_ID = "3f94cb48-48e1-42a0-bcb9-b202c4e730a2";

/**
 * Configure how notifications are displayed when the app is in the foreground.
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Register for push notifications on iOS and Android.
 * - Checks if running on a physical device
 * - Sets up Android notification channel
 * - Requests permission
 * - Gets the Expo push token
 * - Sends the token to the backend via PATCH /users/me
 *
 * Only sends the token once (persisted in SecureStore).
 * Call this after the user is authenticated.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Set up Android notification channel (required for Android 8+)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563EB",
      sound: "default",
    });
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission not granted");
    return null;
  }

  // Get the Expo push token (retry once after delay if FCM isn't ready)
  const token = await getTokenWithRetry();
  if (!token) return null;

  // Send token to backend (only if not already sent)
  await sendTokenToBackend(token);
  return token;
}

/**
 * Attempts to get the push token, retrying once after 3s if FCM throws SERVICE_NOT_AVAILABLE.
 */
async function getTokenWithRetry(retries = 2, delayMs = 3000): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: EAS_PROJECT_ID,
      });
      console.log("Expo push token:", tokenData.data);
      return tokenData.data;
    } catch (error) {
      console.warn(`Push token attempt ${attempt}/${retries} failed:`, error);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  return null;
}

/**
 * Sends the push token to the backend via PATCH /users/me.
 * Skips if the same token was already sent (stored in SecureStore).
 */
async function sendTokenToBackend(token: string): Promise<void> {
  try {
    const sentToken = await SecureStore.getItemAsync(NOTIFICATION_TOKEN_KEY);

    // Skip if we already sent this exact token
    if (sentToken === token) {
      return;
    }

    await api.patch("/users/me", { notificationToken: token });
    await SecureStore.setItemAsync(NOTIFICATION_TOKEN_KEY, token);
    console.log("Push token sent to backend");
  } catch (error) {
    console.error("Failed to send push token to backend:", error);
  }
}

/**
 * Clear the stored token (call on logout so next login re-registers).
 */
export async function clearPushTokenStore(): Promise<void> {
  await SecureStore.deleteItemAsync(NOTIFICATION_TOKEN_KEY);
}
