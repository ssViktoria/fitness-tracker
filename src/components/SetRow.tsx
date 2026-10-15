import { Pressable, Text, TextInput, View, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { parseSet, type SetDraft } from "@/utils/workout";

type Props = {
  index: number;
  set: SetDraft;
  onChange: (patch: Partial<SetDraft>) => void;
};

export function SetRow({ index, set, onChange }: Props) {
  const dark = useColorScheme() === "dark";
  const parsed = parseSet(set);
  const textColor = dark ? "#F1F5F9" : "#0F172A";

  const inputClass = (valid: boolean) =>
    `rounded-xl px-3 py-3 text-center text-base font-semibold ${
      set.done ? "bg-primary/10" : "bg-background dark:bg-background-dark"
    } ${valid ? "" : "border border-red-500"}`;

  const toggleDone = () => {
    // не даємо відзначити підхід із некоректними значеннями
    if (!set.done && !parsed.valid) return;
    onChange({ done: !set.done });
  };

  return (
    <View
      className={`mb-2 flex-row items-center rounded-2xl p-2.5 ${
        set.done ? "bg-primary/15" : "bg-surface dark:bg-surface-dark"
      }`}
    >
      <View className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-background dark:bg-background-dark">
        <Text className="font-bold text-text-muted">{index + 1}</Text>
      </View>

      <View className="mr-2 flex-1">
        <TextInput
          value={set.weight}
          editable={!set.done}
          keyboardType="decimal-pad"
          selectTextOnFocus
          placeholder="кг"
          placeholderTextColor="#64748B"
          onChangeText={(t) =>
            onChange({ weight: t.replace(",", ".").replace(/[^0-9.]/g, "") })
          }
          className={inputClass(parsed.weightValid)}
          style={{ color: textColor }}
        />
      </View>

      <Text className="mr-2 text-text-muted">×</Text>

      <View className="mr-3 flex-1">
        <TextInput
          value={set.reps}
          editable={!set.done}
          keyboardType="number-pad"
          selectTextOnFocus
          placeholder="повт."
          placeholderTextColor="#64748B"
          onChangeText={(t) => onChange({ reps: t.replace(/[^0-9]/g, "") })}
          className={inputClass(parsed.repsValid)}
          style={{ color: textColor }}
        />
      </View>

      <Pressable
        onPress={toggleDone}
        accessibilityLabel={set.done ? "Скасувати підхід" : "Підхід виконано"}
        className={`h-11 w-11 items-center justify-center rounded-full ${
          set.done ? "bg-primary" : "bg-background dark:bg-background-dark"
        } ${!set.done && !parsed.valid ? "opacity-40" : ""}`}
      >
        <Ionicons
          name="checkmark"
          size={24}
          color={set.done ? "#fff" : "#64748B"}
        />
      </Pressable>
    </View>
  );
}