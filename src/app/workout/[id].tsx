import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { SetRow } from "../../components/SetRow";
import { SwipeableSetRow } from "../../components/SwipeableSetRow";
import { DraggableList } from "../../components/DraggableList";
import { RestTimer } from "../../components/RestTimer";
import { MusicButton } from "../../components/MusicButton";
import { useOfflineMutation } from "../../hooks/useOfflineMutation";
import { formatDuration, useStopwatch } from "../../hooks/useStopwatch";
import { useTheme } from "../../hooks/useTheme";
import { hapticError, hapticLight, hapticSelect } from "../../utils/haptics";
import { calcTonnage, parseSet, type ExerciseBlock, type SetDraft } from "../../utils/workout";

// uid потрібен для drag-and-drop: стабільний ідентифікатор блоку вправи
type Block = ExerciseBlock & { uid: string };

const LABELS: Record<string, string> = {
  chest: "Груди", back: "Спина", legs: "Ноги", core: "Прес", arms: "Руки",
};

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background p-6 dark:bg-background-dark">
      <Stack.Screen options={{ headerShown: false }} />
      {children}
    </SafeAreaView>
  );
}

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { primary, muted } = useTheme();
  const workout = useQuery(api.workouts.getWithExercises, { id: id as Id<"workouts"> });
  // B.2: без мережі виклик потрапляє в чергу і відправиться сам, коли мережа з'явиться
  const complete = useOfflineMutation(api.workouts.complete);

  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState(false); // 6.2
  const [timerOpen, setTimerOpen] = useState(false); // 6.3–6.5

  // ініціалізуємо підходи один раз, коли тренування завантажилось
  useEffect(() => {
    if (!workout || blocks !== null || workout.isCompleted) return;
    setBlocks(
      workout.items.map((it, idx) => ({
        uid: `${it.exerciseId}-${idx}`,
        exerciseId: it.exerciseId,
        title: it.title,
        muscleGroup: it.muscleGroup,
        sets: Array.from({ length: it.sets }, () => ({
          weight: String(it.weightKg),
          reps: String(it.reps),
          done: false,
        })),
      }))
    );
  }, [workout, blocks]);

  const seconds = useStopwatch(blocks !== null && !finishing);
  const tonnage = useMemo(() => (blocks ? calcTonnage(blocks) : 0), [blocks]);
  const doneCount = useMemo(
    () => blocks?.reduce((n, b) => n + b.sets.filter((s) => s.done).length, 0) ?? 0,
    [blocks]
  );
  const totalCount = useMemo(
    () => blocks?.reduce((n, b) => n + b.sets.length, 0) ?? 0,
    [blocks]
  );

  const updateSet = (bi: number, si: number, patch: Partial<SetDraft>) => {
    setError(null);
    setBlocks((prev) =>
      prev
        ? prev.map((b, i) =>
            i !== bi
              ? b
              : { ...b, sets: b.sets.map((s, j) => (j !== si ? s : { ...s, ...patch })) }
          )
        : prev
    );
  };

  const addSet = (bi: number) => {
    hapticLight();
    setBlocks((prev) =>
      prev
        ? prev.map((b, i) => {
            if (i !== bi) return b;
            const last = b.sets[b.sets.length - 1];
            return {
              ...b,
              sets: [...b.sets, { weight: last?.weight ?? "0", reps: last?.reps ?? "10", done: false }],
            };
          })
        : prev
    );
  };

  const fail = (msg: string) => {
    hapticError();
    setError(msg);
  };

  const finish = async () => {
    if (!blocks || !workout) return;
    if (doneCount === 0) return fail("Познач хоча б один підхід виконаним");

    setFinishing(true);
    setError(null);
    try {
      const r = await complete({
        id: id as Id<"workouts">,
        durationSeconds: seconds,
        tzOffsetMinutes: new Date().getTimezoneOffset(),
        performed: blocks.map((b) => ({
          exerciseId: b.exerciseId as Id<"exercises">,
          sets: b.sets.map((s) => {
            const p = parseSet(s);
            return { weightKg: p.weightKg, reps: p.reps, done: s.done };
          }),
        })),
      });

      // B.1 + B.3: екран підсумку з конфеті й карткою для Stories
      router.replace({
        pathname: "/workout/summary",
        params: {
          title: workout.title,
          tonnage: String(Math.round(tonnage * 10) / 10),
          durationMinutes: String(Math.max(1, Math.round(seconds / 60))),
          exercises: String(blocks.filter((b) => b.sets.some((s) => s.done)).length),
          sets: String(doneCount),
          offline: r.queued ? "1" : "0",
        },
      });
    } catch (e) {
      fail(e instanceof Error ? e.message : "Не вдалося завершити тренування");
      setFinishing(false);
    }
  };

  if (workout === undefined) {
    return (
      <Centered>
        <ActivityIndicator size="large" color={primary} />
      </Centered>
    );
  }

  if (workout === null) {
    return (
      <Centered>
        <Text className="mb-4 text-lg font-bold text-text dark:text-text-dark">
          Тренування не знайдено
        </Text>
        <Text onPress={() => router.replace("/")} className="font-semibold text-primary">
          На головну
        </Text>
      </Centered>
    );
  }

  if (workout.isCompleted) {
    return (
      <Centered>
        <Ionicons name="checkmark-circle" size={64} color={primary} />
        <Text className="mt-3 text-xl font-bold text-text dark:text-text-dark">
          Тренування вже завершено
        </Text>
        <Text className="mt-1 text-text-muted">
          Піднято {Math.round(workout.tonnage ?? 0)} кг
        </Text>
        <Text onPress={() => router.replace("/")} className="mt-4 font-semibold text-primary">
          На головну
        </Text>
      </Centered>
    );
  }

  const finishDisabled = finishing || blocks === null;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top", "bottom"]}>
      {/* прибираємо білий системний заголовок: у екрана є власна шапка зі стрілкою «назад» */}
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, width: "100%", maxWidth: 760, alignSelf: "center" }}>
        {/* шапка: назва, секундомір, тоннаж */}
        <View className="px-4 pb-3 pt-3">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              className="mr-3 rounded-full bg-surface p-2.5 dark:bg-surface-dark"
            >
              <Ionicons name="chevron-back" size={22} color={primary} />
            </Pressable>
            <Text numberOfLines={1} className="flex-1 text-2xl font-bold text-text dark:text-text-dark">
              {workout.title}
            </Text>

            {/* 6.2: режим зміни порядку вправ */}
            <Pressable
              onPress={() => {
                hapticSelect();
                setReorderMode((v) => !v);
              }}
              hitSlop={10}
              className={`ml-2 rounded-full p-2.5 ${
                reorderMode ? "bg-primary" : "bg-surface dark:bg-surface-dark"
              }`}
            >
              <Ionicons name="swap-vertical" size={22} color={reorderMode ? "#fff" : primary} />
            </Pressable>

            {/* 6.3: таймер відпочинку */}
            <Pressable
              onPress={() => {
                hapticSelect();
                setTimerOpen((v) => !v);
              }}
              hitSlop={10}
              className={`ml-2 rounded-full p-2.5 ${
                timerOpen ? "bg-primary" : "bg-surface dark:bg-surface-dark"
              }`}
            >
              <Ionicons name="timer-outline" size={22} color={timerOpen ? "#fff" : primary} />
            </Pressable>
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-surface p-4 dark:bg-surface-dark">
              <Text className="text-xs font-semibold uppercase text-text-muted">Час</Text>
              <Text className="mt-1 text-2xl font-bold text-text dark:text-text-dark">
                {formatDuration(seconds)}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-surface p-4 dark:bg-surface-dark">
              <Text className="text-xs font-semibold uppercase text-text-muted">Тоннаж</Text>
              <Text className="mt-1 text-2xl font-bold text-primary">
                {Math.round(tonnage * 10) / 10} кг
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-surface p-4 dark:bg-surface-dark">
              <Text className="text-xs font-semibold uppercase text-text-muted">Підходи</Text>
              <Text className="mt-1 text-2xl font-bold text-text dark:text-text-dark">
                {doneCount}/{totalCount}
              </Text>
            </View>
          </View>
        </View>

        {blocks === null ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : reorderMode ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingTop: 8 }}
            scrollEnabled={false}
          >
            <Text className="mb-3 text-text-muted">
              Утримуй картку й перетягуй, щоб змінити порядок вправ
            </Text>
            <DraggableList
              data={blocks.map((b) => ({ id: b.uid, block: b }))}
              itemHeight={64}
              gap={8}
              onReorder={(next) => setBlocks(next.map((n) => n.block))}
              renderItem={({ block }) => (
                <View
                  style={{ flex: 1 }}
                  className="flex-row items-center rounded-2xl bg-surface px-4 dark:bg-surface-dark"
                >
                  <Ionicons name="reorder-three" size={24} color={muted} />
                  <Text
                    numberOfLines={1}
                    className="ml-3 flex-1 text-lg font-bold text-text dark:text-text-dark"
                  >
                    {block.title}
                  </Text>
                  <Text className="text-xs font-semibold text-primary">
                    {LABELS[block.muscleGroup] ?? block.muscleGroup}
                  </Text>
                </View>
              )}
            />
          </ScrollView>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingTop: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            {blocks.map((block, bi) => (
              <View key={block.uid} className="mb-5">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="flex-1 pr-3 text-xl font-bold text-text dark:text-text-dark">
                    {block.title}
                  </Text>
                  <View className="rounded-full bg-primary/15 px-3 py-1">
                    <Text className="text-xs font-semibold text-primary">
                      {LABELS[block.muscleGroup] ?? block.muscleGroup}
                    </Text>
                  </View>
                </View>

                {block.sets.map((set, si) => (
                  // 6.1: свайп вправо понад 80px відмічає підхід виконаним
                  <SwipeableSetRow
                    key={si}
                    completed={set.done}
                    onComplete={() => {
                      updateSet(bi, si, { done: true });
                      setTimerOpen(true);
                    }}
                  >
                    <SetRow
                      index={si}
                      set={set}
                      onChange={(patch: Partial<SetDraft>) => updateSet(bi, si, patch)}
                    />
                  </SwipeableSetRow>
                ))}

                <Pressable onPress={() => addSet(bi)} className="mt-1 items-center py-2">
                  <Text className="font-semibold text-primary">+ Додати підхід</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {/* музика: відкриває Spotify із плейлистом */}
        <MusicButton />

        {/* 6.3–6.5: таймер лишається змонтованим, щоб не скидатись при згортанні */}
        <View style={{ display: timerOpen ? "flex" : "none" }} className="items-center pb-3 pt-1">
          <RestTimer />
        </View>

        <View className="px-4 pb-4 pt-2">
          {error && <Text className="mb-2 text-center text-danger">{error}</Text>}
          <Pressable
            onPress={finish}
            disabled={finishDisabled}
            className={`items-center rounded-2xl bg-primary py-4 ${finishDisabled ? "opacity-60" : ""}`}
          >
            {finishing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-lg font-bold text-white">Завершити тренування</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}