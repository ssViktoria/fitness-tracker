import { useEffect } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export function ProfileCard() {
  const user = useQuery(api.users.me);
  const refreshStreak = useMutation(api.users.refreshStreak);
  const { signOut } = useAuthActions();

  useEffect(() => {
    refreshStreak({ tzOffsetMinutes: new Date().getTimezoneOffset() }).catch(() => {});
  }, [refreshStreak]);

  if (user === undefined) {
    return (
      <View className="h-24 items-center justify-center rounded-card bg-surface dark:bg-surface-dark">
        <ActivityIndicator color="#22C55E" />
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
        <Image source={{ uri: user.avatarUrl }} className="h-16 w-16 rounded-full" />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Text className="text-xl font-bold text-white">{initials}</Text>
        </View>
      )}

      <View className="ml-4 flex-1">
        <Text className="text-lg font-bold text-text dark:text-text-dark">
          {name}
        </Text>
        <Text className="text-base text-accent">
          🔥 {user?.streakDays ?? 0} {"днів поспіль"}
        </Text>
      </View>

      <Pressable onPress={() => signOut()} hitSlop={10}>
        <Text className="text-sm font-medium text-danger">Вийти</Text>
      </Pressable>
    </View>
  );
}