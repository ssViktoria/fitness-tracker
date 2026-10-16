import "@/global.css";
import { ActivityIndicator, Platform, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ReducedMotionConfig, ReduceMotion } from "react-native-reanimated";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ErrorScreen } from "@/components/ErrorScreen";
import { SettingsProvider } from "@/i18n/SettingsProvider";
import { OfflineSyncProvider } from "@/hooks/useOfflineSync";
import { useTheme } from "@/hooks/useTheme";

export const ErrorBoundary = ErrorScreen;

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? "light" : "dark"} />;
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout/[id]" options={{ headerShown: true, title: "Тренування" }} />
        <Stack.Screen
          name="workout/create"
          options={{ headerShown: true, title: "Нове тренування", presentation: "modal" }}
        />
        {/* B.1 + B.3: підсумок тренування з конфеті й карткою для Stories */}
        <Stack.Screen
          name="workout/summary"
          options={{ headerShown: false, gestureEnabled: false, animation: "fade" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReducedMotionConfig mode={ReduceMotion.Never} />
      <SafeAreaProvider>
        <SettingsProvider>
          <ConvexAuthProvider client={convex} storage={Platform.OS === "web" ? undefined : secureStorage}>
            {/* B.2: відправляє офлайн-чергу, коли з'являється мережа */}
            <OfflineSyncProvider>
              <ThemedStatusBar />
              <OfflineBanner />
              <RootNavigator />
            </OfflineSyncProvider>
          </ConvexAuthProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}