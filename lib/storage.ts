import { User } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "draftien:user";
const TOKEN_KEY = "draftien:token";
const OTP_EMAIL_KEY = "draftien:pending-email";

export const saveUser = async (user: User) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? (JSON.parse(data) as User) : null;
};

export const removeUser = async () => {
  await AsyncStorage.removeItem(USER_KEY);
};

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const savePendingEmail = async (email: string) => {
  await AsyncStorage.setItem(OTP_EMAIL_KEY, email);
};

export const getPendingEmail = async () => {
  return AsyncStorage.getItem(OTP_EMAIL_KEY);
};

export const removePendingEmail = async () => {
  await AsyncStorage.removeItem(OTP_EMAIL_KEY);
};

export const clearAuthData = async () => {
  await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, OTP_EMAIL_KEY]);
};
