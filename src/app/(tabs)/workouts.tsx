import { useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useDebounce } from "@/hooks/useDebounce";
import { MuscleChips } from "@/components/MuscleChips";
import { ExerciseCard } from "@/components/ExerciseCard";

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6 dark:bg-background-dark">
      <Text className="mb-2 text-lg font-bold text-danger">Не вдалося завантажити вправи</Text>
      <Text className="mb-4 text-center text-text-muted">{error.message}</Text>
      <Text onPress={retry} className="font-semibold text-primary">Спробувати ще раз</Text>
    </View>
  );
}

export default function WorkoutsScreen() {
  const dark = useColorScheme() === "dark";
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<string | undefined>();
  const debounced = useDebounce(search, 300);

  const exercises = useQuery(api.exercises.list, {
    search: debounced || undefined,
    muscleGroup: group,
  });

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      {/* Обмеження ширини для вебу: на телефоні нічого не змінює */}
      <View style={{ flex: 1, width: "100%", maxWidth: 720, alignSelf: "center" }}>
        <Text className="px-4 pb-3 pt-2 text-3xl font-bold text-text dark:text-text-dark">
          Вправи
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Пошук вправи..."
          placeholderTextColor="#64748B"
          autoCorrect={false}
          className="mx-4 mb-3 rounded-xl bg-surface px-4 py-3 text-text dark:bg-surface-dark dark:text-text-dark"
          style={{ color: dark ? "#F1F5F9" : "#0F172A" }}
        />

        <MuscleChips value={group} onChange={setGroup} />

        {exercises === undefined ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#22C55E" />
          </View>
        ) : (
          <FlatList
            data={exercises}
            keyExtractor={(e) => e._id}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            renderItem={({ item }) => <ExerciseCard {...item} />}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center">
                <Text className="text-text-muted">Нічого не знайдено</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}