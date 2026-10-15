import { Pressable, ScrollView, Text, View } from "react-native";

export const MUSCLE_GROUPS = [
  { key: undefined, label: "Усі" },
  { key: "chest", label: "Груди" },
  { key: "back", label: "Спина" },
  { key: "legs", label: "Ноги" },
  { key: "core", label: "Прес" },
  { key: "arms", label: "Руки" },
] as const;

type Props = { value?: string; onChange: (v?: string) => void };

export function MuscleChips({ value, onChange }: Props) {
  return (
    <View style={{ height: 56, flexGrow: 0, flexShrink: 0 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 10,
          alignItems: "center",
        }}
      >
        {MUSCLE_GROUPS.map((g) => {
          const active = value === g.key;
          return (
            <Pressable
              key={g.label}
              onPress={() => onChange(g.key)}
              className={`rounded-full px-5 py-2.5 ${
                active ? "bg-primary" : "bg-surface dark:bg-surface-dark"
              }`}
            >
              <Text
                numberOfLines={1}
                className={`text-base font-semibold ${
                  active ? "text-white" : "text-text dark:text-text-dark"
                }`}
              >
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}