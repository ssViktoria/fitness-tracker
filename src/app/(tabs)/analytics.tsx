import { useState } from "react";
import { Pressable, ScrollView, Text, View, useColorScheme, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { api } from "../../../convex/_generated/api";

const PERIODS = [
  { key: "week", label: "Тиждень", days: 7 },
  { key: "month", label: "Місяць", days: 30 },
] as const;

const fmt = (n: number) => n.toLocaleString("uk-UA");

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-card bg-surface p-3 dark:bg-surface-dark">
      <Text className="text-xl font-bold text-text dark:text-text-dark">{value}</Text>
      <Text className="text-xs text-text-muted">{label}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const dark = useColorScheme() === "dark";
  const { width } = useWindowDimensions();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[0]);
  const [openId, setOpenId] = useState<string | null>(null);

  const tzOffset = new Date().getTimezoneOffset();
  const stats = useQuery(api.analytics.stats, { days: period.days, tzOffset });
  const history = useQuery(api.analytics.history, { days: period.days });

  const axisText = { color: "#64748B", fontSize: 10 };
  const chartWidth = width - 32 - 64;
  const isWeek = period.days === 7;
  const barWidth = isWeek ? 24 : 6;
  const spacing = Math.max(2, (chartWidth - period.days * barWidth) / period.days);
  const labelEvery = isWeek ? 1 : 5;

  const tonnageData =
    stats?.days.map((d, i) => ({
      value: d.tonnage,
      label: i % labelEvery === 0 ? d.label : "",
      frontColor: "#22C55E",
    })) ?? [];

  const caloriesData =
    stats?.days.map((d, i) => ({
      value: d.calories,
      label: i % labelEvery === 0 ? d.label : "",
    })) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text className="mb-4 text-3xl font-bold text-text dark:text-text-dark">Аналітика</Text>

        {/* 7.3 Перемикач періоду */}
        <View className="mb-4 flex-row rounded-xl bg-surface p-1 dark:bg-surface-dark">
          {PERIODS.map((p) => {
            const active = p.key === period.key;
            return (
              <Pressable
                key={p.key}
                onPress={() => setPeriod(p)}
                className={`flex-1 items-center rounded-lg py-2 ${active ? "bg-primary" : ""}`}
              >
                <Text className={`font-semibold ${active ? "text-white" : "text-text-muted"}`}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {stats && (
          <>
            <View className="mb-4 flex-row gap-3">
              <Stat label="Тренувань" value={String(stats.totals.workouts)} />
              <Stat label="Тоннаж, кг" value={fmt(stats.totals.tonnage)} />
              <Stat label="Ккал" value={fmt(stats.totals.calories)} />
            </View>

            {/* 7.2 Графіки */}
            <View className="mb-4 overflow-hidden rounded-card bg-surface p-4 dark:bg-surface-dark">
              <Text className="mb-3 font-bold text-text dark:text-text-dark">Піднята вага, кг</Text>
              <BarChart
                data={tonnageData}
                width={chartWidth}
                barWidth={barWidth}
                spacing={spacing}
                initialSpacing={4}
                barBorderRadius={4}
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={0}
                rulesColor={dark ? "#334155" : "#E2E8F0"}
                yAxisTextStyle={axisText}
                xAxisLabelTextStyle={axisText}
                isAnimated
              />
            </View>

            <View className="mb-6 overflow-hidden rounded-card bg-surface p-4 dark:bg-surface-dark">
              <Text className="mb-3 font-bold text-text dark:text-text-dark">Калорії, ккал</Text>
              <LineChart
                data={caloriesData}
                width={chartWidth}
                spacing={chartWidth / period.days}
                initialSpacing={8}
                endSpacing={8}
                color="#F97316"
                thickness={3}
                curved
                areaChart
                startFillColor="#F97316"
                endFillColor="#F97316"
                startOpacity={0.3}
                endOpacity={0.02}
                hideDataPoints={!isWeek}
                dataPointsColor="#F97316"
                noOfSections={4}
                yAxisThickness={0}
                xAxisThickness={0}
                rulesColor={dark ? "#334155" : "#E2E8F0"}
                yAxisTextStyle={axisText}
                xAxisLabelTextStyle={axisText}
                isAnimated
              />
            </View>
          </>
        )}

        {/* 7.4 Історія */}
        <Text className="mb-3 text-xl font-bold text-text dark:text-text-dark">Історія тренувань</Text>
        {history?.length === 0 && (
          <Text className="text-text-muted">За цей період тренувань немає</Text>
        )}
        {history?.map((w) => {
          const open = openId === w._id;
          return (
            <Pressable
              key={w._id}
              onPress={() => setOpenId(open ? null : w._id)}
              className="mb-3 rounded-card bg-surface p-4 dark:bg-surface-dark"
            >
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-base font-bold text-text dark:text-text-dark">{w.title}</Text>
                <Text className="text-xs text-text-muted">
                  {new Date(w.completedAt).toLocaleDateString("uk-UA")}
                </Text>
              </View>
              <Text className="mt-1 text-text-muted">
                {w.durationMinutes} хв · {fmt(w.tonnage)} кг · {w.calories} ккал
              </Text>
              {open &&
                w.exercises.map((e, i) => (
                  <View key={i} className="mt-2 flex-row justify-between">
                    <Text className="flex-1 text-text dark:text-text-dark">{e.title}</Text>
                    <Text className="text-text-muted">
                      {e.sets}×{e.reps} · {e.weightKg} кг
                    </Text>
                  </View>
                ))}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}