import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from "react-native-safe-area-context";

export function useIsOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    return NetInfo.addEventListener((s) => setOnline(s.isConnected !== false));
  }, []);
  return online;
}

export function OfflineBanner() {
  const online = useIsOnline();
  if (online) return null;
  return (
    <SafeAreaView edges={["top"]} className="bg-danger">
      <View className="px-4 py-2">
        <Text className="text-center text-sm font-semibold text-white">
          Немає з'єднання з інтернетом
        </Text>
      </View>
    </SafeAreaView>
  );
}