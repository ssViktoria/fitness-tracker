import { useState } from "react";
import { Pressable, Text, TextInput, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type DraftItem = {
  key: string;
  exerciseId: string;
  title: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weightKg: number;
};

const LABELS: Record<string, string> = {
  chest: "Груди", back: "Спина", legs: "Ноги", core: "Прес", arms: "Руки",
};

function NumberField({
  label,
  value,
  decimal,
  onChange,
}: {
  label: string;
  value: number;
  decimal?: boolean;
  onChange: (n: number) => void;
}) {
  const dark = useColorScheme() === "dark";
  const [text, setText] = useState(String(value));

  return (
    <View className="flex-1">
      <Text className="mb-1.5 text-xs font-semibold text-text-muted">{label}</Text>
      <TextInput
        value={text}
        keyboardType={decimal ? "decimal-pad" : "number-pad"}
        selectTextOnFocus
        onChangeText={(t) => {
          const clean = t.replace(",", ".").replace(decimal ? /[^0-9.]/g : /[^0-9]/g, "");
          setText(clean);
          const n = parseFloat(clean);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        onBlur={() => setText(String(value))}
        className="rounded-xl bg-background px-3 py-3 text-center text-base font-semibold dark:bg-background-dark"
        style={{ color: dark ? "#F1F5F9" : "#0F172A" }}
      />
    </View>
  );
}

type Props = {
  item: DraftItem;
  onChange: (patch: Partial<DraftItem>) => void;
  onRemove: () => void;
};

export function WorkoutExerciseRow({ item, onChange, onRemove }: Props) {
  return (
    <View className="mb-3 rounded-2xl bg-surface p-4 dark:bg-surface-dark">
      <View className="mb-3 flex-row items-center">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-bold text-text dark:text-text-dark">{item.title}</Text>
          <Text className="mt-0.5 text-sm text-text-muted">
            {LABELS[item.muscleGroup] ?? item.muscleGroup}
          </Text>
        </View>
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityLabel="Видалити вправу"
          className="rounded-full bg-red-500/15 p-2.5"
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </Pressable>
      </View>

      <View className="flex-row gap-3">
        <NumberField label="Підходи" value={item.sets} onChange={(n) => onChange({ sets: n })} />
        <NumberField label="Повтори" value={item.reps} onChange={(n) => onChange({ reps: n })} />
        <NumberField
          label="Вага, кг"
          value={item.weightKg}
          decimal
          onChange={(n) => onChange({ weightKg: n })}
        />
      </View>
    </View>
  );
}