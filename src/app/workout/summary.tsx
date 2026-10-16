import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Confetti } from "../../components/Confetti";
import { ShareCard } from "../../components/ShareCard";

type Params = {
  title?: string;
  tonnage?: string;
  durationMinutes?: string;
  exercises?: string;
  sets?: string;
  /** "1", якщо тренування збережене офлайн і ще не синхронізоване */
  offline?: string;
};

const num = (s?: string) => Number(s) || 0;

export default function WorkoutSummaryScreen() {
  const p = useLocalSearchParams<Params>();
  const me = useQuery(api.users.me);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const cardRef = useRef<View>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  // Картка 9:16 має вміститися між заголовком і кнопками
  const freeHeight = height - insets.top - insets.bottom - 230;
  const cardWidth = Math.max(180, Math.min(width - 48, (freeHeight * 9) / 16));

  const share = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Недоступно", "На цьому пристрої не можна поділитися зображенням.");
        return;
      }
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        width: 1080,
        height: 1920,
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        UTI: "public.png",
        dialogTitle: "Поділитися тренуванням",
      });
    } catch {
      Alert.alert("Помилка", "Не вдалося створити картку. Спробуйте ще раз.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <View
      className="flex-1 bg-background dark:bg-background-dark"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      {/* Тап по заголовку запускає салют ще раз */}
      <Pressable onPress={() => setConfettiKey((k) => k + 1)} className="items-center px-6 py-4">
        <Text className="text-2xl font-bold text-text dark:text-text-dark">
          Тренування завершено
        </Text>
        {p.offline === "1" ? (
          <Text className="mt-1 text-center text-sm text-accent">
            Збережено офлайн. Дані відправляться, щойно з'явиться мережа.
          </Text>
        ) : null}
      </Pressable>

      <View className="flex-1 items-center justify-center">
        <ShareCard
          ref={cardRef}
          width={cardWidth}
          title={p.title ?? "Тренування"}
          tonnage={num(p.tonnage)}
          durationMinutes={num(p.durationMinutes)}
          exercises={num(p.exercises)}
          sets={num(p.sets)}
          streak={me?.streakDays ?? 0}
        />
      </View>

      <View className="px-6">
        <Pressable
          onPress={share}
          disabled={sharing}
          className="items-center rounded-xl bg-primary py-4 active:opacity-80"
        >
          {sharing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Поділитися в Stories</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.replace("/")}
          className="mt-3 items-center rounded-xl border border-slate-300 py-4 active:opacity-80 dark:border-slate-600"
        >
          <Text className="text-base font-semibold text-text dark:text-text-dark">Готово</Text>
        </Pressable>
      </View>

      <Confetti key={confettiKey} />
    </View>
  );
}