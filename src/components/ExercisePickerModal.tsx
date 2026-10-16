import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useDebounce } from "@/hooks/useDebounce";
import { MuscleChips } from "./MuscleChips";
import { ExerciseGif } from "./ExerciseGif";

export type PickedExercise = {
  _id: Id<"exercises">;
  title: string;
  muscleGroup: string;
};

type Props = {
  visible: boolean;
  addedIds: string[];
  onPick: (exercise: PickedExercise) => void;
  onClose: () => void;
};

const LABELS: Record<string, string> = {
  chest: "Груди", back: "Спина", legs: "Ноги", core: "Прес", arms: "Руки",
};

export function ExercisePickerModal({ visible, addedIds, onPick, onClose }: Props) {
  const dark = useColorScheme() === "dark";
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<string | undefined>();
  const debounced = useDebounce(search, 300);

  const exercises = useQuery(api.exercises.list, {
    search: debounced || undefined,
    muscleGroup: group,
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <View style={{ flex: 1, width: "100%", maxWidth: 760, alignSelf: "center" }}>
          <View className="flex-row items-center justify-between px-4 pb-3 pt-3">
            <Text className="text-3xl font-bold text-text dark:text-text-dark">
              Додати вправу
            </Text>
            <Pressable onPress={onClose} className="rounded-full bg-primary px-5 py-2.5">
              <Text className="font-semibold text-white">Готово</Text>
            </Pressable>
          </View>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Пошук вправи..."
            placeholderTextColor="#64748B"
            autoCorrect={false}
            className="mx-4 mb-4 rounded-2xl bg-surface px-5 py-4 text-base dark:bg-surface-dark"
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
              contentContainerStyle={{ padding: 16, paddingTop: 8, flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const added = addedIds.includes(item._id);
                return (
                  <Pressable
                    onPress={() =>
                      onPick({ _id: item._id, title: item.title, muscleGroup: item.muscleGroup })
                    }
                    className="mb-3 flex-row items-center rounded-2xl bg-surface p-4 dark:bg-surface-dark"
                  >
                    <ExerciseGif
                      gifUrl={item.gifUrl}
                      resizeMode="cover"
                      style={{ width: 64, height: 64, borderRadius: 12, marginRight: 12, overflow: "hidden" }}
                    />
                    <View className="flex-1 pr-3">
                      <Text className="text-lg font-bold text-text dark:text-text-dark">
                        {item.title}
                      </Text>
                      <Text className="mt-1 text-sm text-text-muted">
                        {LABELS[item.muscleGroup] ?? item.muscleGroup}
                      </Text>
                    </View>
                    <Ionicons
                      name={added ? "checkmark-circle" : "add-circle-outline"}
                      size={28}
                      color="#22C55E"
                    />
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center">
                  <Text className="text-base text-text-muted">Нічого не знайдено</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}