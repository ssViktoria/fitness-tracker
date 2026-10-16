import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { formatWeight, type WeightUnit } from "@/utils/units";

type Stats = {
  workouts: number;
  streakDays: number;
  tonnage: number; // кг
  minutes: number;
};

type Kind = "count" | "days" | "kg" | "min";

type Def = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  kind: Kind;
  target: number;
  value: (s: Stats) => number;
  title: (uk: boolean, fmt: (kg: number) => string) => string;
};

const DEFS: Def[] = [
  { id: "w1", icon: "flag", kind: "count", target: 1, value: (s) => s.workouts,
    title: (uk) => (uk ? "Перше тренування" : "First workout") },
  { id: "w10", icon: "barbell", kind: "count", target: 10, value: (s) => s.workouts,
    title: (uk) => (uk ? "10 тренувань" : "10 workouts") },
  { id: "w50", icon: "medal", kind: "count", target: 50, value: (s) => s.workouts,
    title: (uk) => (uk ? "50 тренувань" : "50 workouts") },
  { id: "s3", icon: "flame", kind: "days", target: 3, value: (s) => s.streakDays,
    title: (uk) => (uk ? "Стрік 3 дні" : "3-day streak") },
  { id: "s7", icon: "flame", kind: "days", target: 7, value: (s) => s.streakDays,
    title: (uk) => (uk ? "Стрік 7 днів" : "7-day streak") },
  { id: "s30", icon: "bonfire", kind: "days", target: 30, value: (s) => s.streakDays,
    title: (uk) => (uk ? "Стрік 30 днів" : "30-day streak") },
  { id: "t1", icon: "trending-up", kind: "kg", target: 1000, value: (s) => s.tonnage,
    title: (uk, f) => (uk ? `Піднято ${f(1000)}` : `Lifted ${f(1000)}`) },
  { id: "t10", icon: "trending-up", kind: "kg", target: 10000, value: (s) => s.tonnage,
    title: (uk, f) => (uk ? `Піднято ${f(10000)}` : `Lifted ${f(10000)}`) },
  { id: "t100", icon: "trophy", kind: "kg", target: 100000, value: (s) => s.tonnage,
    title: (uk, f) => (uk ? `Піднято ${f(100000)}` : `Lifted ${f(100000)}`) },
  { id: "m600", icon: "time", kind: "min", target: 600, value: (s) => s.minutes,
    title: (uk) => (uk ? "10 годин у залі" : "10 hours trained") },
];

export function Achievements({
  stats,
  unit,
  locale,
}: {
  stats: Stats;
  unit: WeightUnit;
  locale: string;
}) {
  const { primary, muted } = useTheme();
  const uk = locale.startsWith("uk");
  const fmt = (kg: number) => formatWeight(kg, unit, locale);

  const items = DEFS.map((d) => {
    const v = d.value(stats);
    return { d, v, done: v >= d.target, pct: Math.min(v / d.target, 1) };
  });
  const unlocked = items.filter((i) => i.done).length;

  const progressText = (d: Def, v: number) => {
    const shown = Math.min(v, d.target);
    if (d.kind === "kg") return `${fmt(shown)} / ${fmt(d.target)}`;
    if (d.kind === "min") return `${Math.floor(shown / 60)} / ${d.target / 60} ${uk ? "год" : "h"}`;
    return `${Math.floor(shown)} / ${d.target}`;
  };

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-text dark:text-text-dark">
          {uk ? "Досягнення" : "Achievements"}
        </Text>
        <Text className="font-semibold text-primary">
          {unlocked}/{DEFS.length}
        </Text>
      </View>

      <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
        {items.map(({ d, v, done, pct }) => (
          <View key={d.id} style={{ width: "50%", padding: 6 }}>
            <View
              className={`rounded-card p-3 ${done ? "bg-primary/15" : "bg-surface dark:bg-surface-dark"}`}
            >
              <View className="flex-row items-center">
                <View
                  className={`h-10 w-10 items-center justify-center rounded-full ${
                    done ? "bg-primary" : "bg-background dark:bg-background-dark"
                  }`}
                >
                  <Ionicons
                    name={done ? d.icon : "lock-closed"}
                    size={20}
                    color={done ? "#fff" : muted}
                  />
                </View>
                <Text
                  numberOfLines={2}
                  className="ml-2 flex-1 text-sm font-bold text-text dark:text-text-dark"
                >
                  {d.title(uk, fmt)}
                </Text>
              </View>

              <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-background dark:bg-background-dark">
                <View style={{ width: `${pct * 100}%`, height: "100%", backgroundColor: primary }} />
              </View>
              <Text className="mt-1.5 text-xs text-text-muted">{progressText(d, v)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}