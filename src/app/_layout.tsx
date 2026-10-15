import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ConvexProvider client={convex}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="workout/[id]"
              options={{ headerShown: true, title: "Тренування" }}
            />
            <Stack.Screen
              name="workout/create"
              options={{
                headerShown: true,
                title: "Нове тренування",
                presentation: "modal",
              }}
            />
          </Stack>
        </ConvexProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}