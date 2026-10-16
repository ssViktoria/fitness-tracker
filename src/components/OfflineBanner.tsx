import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export function useIsOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    return NetInfo.addEventListener((s) => setOnline(s.isConnected !== false));
  }, []);
  return online;
}

export function OfflineBanner() {
  const online = useIsOnline();
  const { pending, syncing } = useOfflineSync();
  if (online && pending === 0) return null;

  let text: string;
  if (!online) {
    text =
      pending > 0
        ? `Немає з'єднання з інтернетом. Очікує синхронізації: ${pending}`
        : "Немає з'єднання з інтернетом";
  } else if (syncing) {
    text = `Синхронізація: ${pending}`;
  } else {
    text = `Очікує синхронізації: ${pending}`;
  }

  return (
    <SafeAreaView edges={["top"]} className={online ? "bg-primary" : "bg-danger"}>
      <View className="px-4 py-2">
        <Text className="text-center text-sm font-semibold text-white">{text}</Text>
      </View>
    </SafeAreaView>
  );
}