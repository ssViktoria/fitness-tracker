import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const web = Platform.OS === "web";

export const storage = {
  get: async (key: string): Promise<string | null> => {
    try {
      if (web) return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  set: async (key: string, value: string) => {
    try {
      if (web) localStorage.setItem(key, value);
      else await SecureStore.setItemAsync(key, value);
    } catch {}
  },
};