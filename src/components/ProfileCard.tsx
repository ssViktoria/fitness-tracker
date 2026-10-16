import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useTheme } from "@/hooks/useTheme";
import { hapticLight } from "@/utils/haptics";

export function ProfileCard() {
  const { primary } = useTheme();
  const user = useQuery(api.profile.get);
  const refreshStreak = useMutation(api.users.refreshStreak);
  const { signOut } = useAuthActions();

  useEffect(() => {
    refreshStreak({ tzOffsetMinutes: new Date().getTimezoneOffset() }).catch(() => {});
  }, [refreshStreak]);

  if (user === undefined) {
    return (
      <View className="h-24 items-center justify-center rounded-card bg-surface dark:bg-surface-dark">
        <ActivityIndicator color={primary} />
      </View>
    );
  }

  const name = user?.name || "Атлет";
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="flex-row items-center rounded-card bg-surface p-4 dark:bg-surface-dark">
      {user?.avatarUrl ? (
        <Image
          source={{ uri: user.avatarUrl }}
          style={{ width: 64, height: 64, borderRadius: 32 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Text className="text-xl font-bold text-white">{initials}</Text>
        </View>
      )}

      <View className="ml-4 flex-1">
        <Text className="text-lg font-bold text-text dark:text-text-dark">{name}</Text>
        <Text className="text-base text-accent">
          🔥 {user?.streakDays ?? 0} днів поспіль
        </Text>
      </View>

      <Pressable
        onPress={() => {
          hapticLight();
          signOut();
        }}
        hitSlop={10}
      >
        <Text className="text-sm font-medium text-danger">Вийти</Text>
      </Pressable>
    </View>
  );
}