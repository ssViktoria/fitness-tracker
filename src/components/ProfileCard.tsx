import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/i18n/SettingsProvider";
import { hapticLight, hapticSelect } from "@/utils/haptics";

export function ProfileCard() {
  const { primary, dark, muted } = useTheme();
  const { setMode, lang, setLang, t } = useSettings();
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

  const name = user?.name || t("home.athlete");
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="rounded-card bg-surface p-4 dark:bg-surface-dark">
      <View className="flex-row items-center">
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
          <Text className="text-base text-accent">{t("home.streak", { n: user?.streakDays ?? 0 })}</Text>
        </View>

        <View className="items-end">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                hapticSelect();
                setMode(dark ? "light" : "dark");
              }}
              hitSlop={8}
              className="h-9 w-9 items-center justify-center rounded-full bg-background dark:bg-background-dark"
            >
              <Ionicons name={dark ? "sunny" : "moon"} size={18} color={muted} />
            </Pressable>
            <Pressable
              onPress={() => {
                hapticSelect();
                setLang(lang === "uk" ? "en" : "uk");
              }}
              hitSlop={8}
              className="h-9 items-center justify-center rounded-full bg-background px-3 dark:bg-background-dark"
            >
              <Text className="text-xs font-bold text-text dark:text-text-dark">{lang.toUpperCase()}</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              hapticLight();
              signOut();
            }}
            hitSlop={10}
            className="mt-2"
          >
            <Text className="text-sm font-medium text-danger">{t("common.logout")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}