import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  offlineAccess: true,
  forceCodeForRefreshToken: false,
});

/**
 * Handles Google authentication and returns the ID token.
 */
export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    const userInfo = await GoogleSignin.signIn();

    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      throw new Error("Google ID Token not found");
    }

    return idToken;
  } catch (error: unknown) {
    const errorCode = typeof error === "object" && error && "code" in error ? error.code : null;

    if (errorCode === statusCodes.SIGN_IN_CANCELLED) {
      console.log("Google Sign-In cancelled");
    } else if (errorCode === statusCodes.IN_PROGRESS) {
      console.log("Google Sign-In already in progress");
    } else if (errorCode === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log("Google Play Services not available");
    } else {
      console.error("Google Sign-In Error:", error);
    }
    return null;
  }
};

/**
 * Optional: Sign out from Google
 */
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error("Google Sign-Out Error:", error);
  }
};
