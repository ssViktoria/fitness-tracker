import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ExercisePickerModal, type PickedExercise } from "@/components/ExercisePickerModal";
import { WorkoutExerciseRow, type DraftItem } from "@/components/WorkoutExerciseRow";
import { useIsOnline } from "@/components/OfflineBanner";
import { useTheme } from "@/hooks/useTheme";
import { hapticError, hapticLight, hapticSuccess } from "@/utils/haptics";

export default function CreateWorkoutScreen() {
  const { c, muted, primary } = useTheme();
  const online = useIsOnline();
  const router = useRouter();
  const createWorkout = useMutation(api.workouts.create);

  const [title, setTitle] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fail = (msg: string) => {
    hapticError();
    setError(msg);
  };

  const addExercise = (ex: PickedExercise) => {
    hapticLight();
    setItems((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${Math.random()}`,
        exerciseId: ex._id,
        title: ex.title,
        muscleGroup: ex.muscleGroup,
        sets: 3,
        reps: 10,
        weightKg: 0,
      },
    ]);
    setError(null);
  };

  const patchItem = (key: string, patch: Partial<DraftItem>) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const removeItem = (key: string) => {
    hapticLight();
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const save = async () => {
    if (!online) return fail("Немає з'єднання з інтернетом");
    if (!title.trim()) return fail("Вкажіть назву тренування");
    if (items.length === 0) return fail("Додайте хоча б одну вправу");
    if (items.some((i) => i.sets < 1 || i.reps < 1)) {
      return fail("Підходи й повторення мають бути більше нуля");
    }

    hapticLight();
    setSaving(true);
    setError(null);
    try {
      const totalSets = items.reduce((s, i) => s + i.sets, 0);
      await createWorkout({
        title: title.trim(),
        // орієнтовна тривалість: ~3 хв на підхід разом із відпочинком
        durationMinutes: Math.max(10, Math.round(totalSets * 3)),
        exercises: items.map((i) => ({
          exerciseId: i.exerciseId as Id<"exercises">,
          sets: i.sets,
          reps: i.reps,
          weightKg: i.weightKg,
        })),
      });
      hapticSuccess();
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Не вдалося зберегти тренування");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top", "bottom"]}>
      <View style={{ flex: 1, width: "100%", maxWidth: 760, alignSelf: "center" }}>
        <View className="flex-row items-center px-4 pb-3 pt-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="mr-3 rounded-full bg-surface p-2.5 dark:bg-surface-dark"
          >
            <Ionicons name="chevron-back" size={22} color={primary} />
          </Pressable>
          <Text className="text-3xl font-bold text-text dark:text-text-dark">
            Нове тренування
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setError(null);
            }}
            placeholder="Назва (наприклад, День грудей)"
            placeholderTextColor={muted}
            maxLength={60}
            className="mb-4 rounded-2xl bg-surface px-5 py-4 text-base dark:bg-surface-dark"
            style={{ color: c.text }}
          />

          {items.length === 0 ? (
            <View className="mb-3 items-center rounded-2xl border border-dashed border-text-muted/40 px-6 py-10">
              <Ionicons name="barbell-outline" size={40} color={muted} />
              <Text className="mt-3 text-center text-base text-text-muted">
                Ще немає вправ. Додай першу з каталогу.
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <WorkoutExerciseRow
                key={item.key}
                item={item}
                onChange={(patch) => patchItem(item.key, patch)}
                onRemove={() => removeItem(item.key)}
              />
            ))
          )}

          <Pressable
            onPress={() => {
              hapticLight();
              setPickerOpen(true);
            }}
            className="mt-1 flex-row items-center justify-center rounded-2xl bg-surface py-4 dark:bg-surface-dark"
          >
            <Ionicons name="add" size={22} color={primary} />
            <Text className="ml-2 text-base font-semibold text-primary">Додати вправу</Text>
          </Pressable>
        </ScrollView>

        <View className="px-4 pb-4 pt-2">
          {error && <Text className="mb-2 text-center text-danger">{error}</Text>}
          <Pressable
            onPress={save}
            disabled={saving || !online}
            className={`items-center rounded-2xl bg-primary py-4 ${saving || !online ? "opacity-60" : ""}`}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-lg font-bold text-white">Зберегти тренування</Text>
            )}
          </Pressable>
        </View>
      </View>

      <ExercisePickerModal
        visible={pickerOpen}
        addedIds={items.map((i) => i.exerciseId)}
        onPick={addExercise}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}