import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function TodayPlanCard() {
  const router = useRouter();
  const plan = useQuery(api.workouts.getTodayPlan);

  if (plan === undefined) {
    return (
      <View className="mx-4 items-center rounded-3xl bg-surface p-8 dark:bg-surface-dark">
        <ActivityIndicator color="#22C55E" />
      </View>
    );
  }

  if (plan === null) {
    return (
      <View className="mx-4 rounded-3xl bg-surface p-6 dark:bg-surface-dark">
        <Text className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          План на сьогодні
        </Text>
        <Text className="mt-2 text-xl font-bold text-text dark:text-text-dark">
          Тренування ще немає
        </Text>
        <Text className="mt-1 text-base text-text-muted">
          Склади програму з вправ каталогу, і вона з'явиться тут.
        </Text>
        <Pressable
          onPress={() => router.push("/workout/create")}
          className="mt-4 flex-row items-center justify-center rounded-2xl bg-primary py-4"
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text className="ml-2 text-base font-bold text-white">Створити тренування</Text>
        </Pressable>
      </View>
    );
  }

  const totalSets = plan.exercises.reduce((s, e) => s + e.sets, 0);

  return (
    <View className="mx-4 rounded-3xl bg-surface p-6 dark:bg-surface-dark">
      <Text className="text-sm font-semibold uppercase tracking-wider text-text-muted">
        План на сьогодні
      </Text>
      <Text className="mt-2 text-2xl font-bold text-text dark:text-text-dark">
        {plan.title}
      </Text>

      <View className="mt-3 flex-row gap-4">
        <View className="flex-row items-center">
          <Ionicons name="barbell-outline" size={18} color="#22C55E" />
          <Text className="ml-1.5 text-base text-text-muted">{plan.exercises.length} вправ</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="layers-outline" size={18} color="#22C55E" />
          <Text className="ml-1.5 text-base text-text-muted">{totalSets} підходів</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={18} color="#22C55E" />
          <Text className="ml-1.5 text-base text-text-muted">~{plan.durationMinutes} хв</Text>
        </View>
      </View>

      <Pressable
        onPress={() =>
          router.push({ pathname: "/workout/[id]", params: { id: plan._id } })
        }
        className="mt-5 flex-row items-center justify-center rounded-2xl bg-primary py-4"
      >
        <Ionicons name="play" size={20} color="#fff" />
        <Text className="ml-2 text-lg font-bold text-white">Почати</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/workout/create")}
        className="mt-3 items-center py-2"
      >
        <Text className="font-semibold text-primary">+ Нове тренування</Text>
      </Pressable>
    </View>
  );
}