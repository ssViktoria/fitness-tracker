import React, { forwardRef } from "react";
import { Text, View } from "react-native";

const MONTHS = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

// 12450 → "12 450"
const spaced = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function plural(n: number, forms: [string, string, string]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
}

export type ShareCardProps = {
  /** Ширина картки на екрані; висота завжди width * 16 / 9 (формат Stories) */
  width: number;
  title: string;
  tonnage: number;
  durationMinutes: number;
  exercises: number;
  sets: number;
  streak: number;
};

const BG = "#0F172A";
const GREEN = "#22C55E";
const ORANGE = "#F97316";
const MUTED = "#94A3B8";
const TEXT = "#F1F5F9";

/**
 * Картка-звіт для Stories. Усі розміри рахуються від ширини (u = width / 360),
 * тому вигляд однаковий і на екрані, і в зображенні, яке зберігаємо.
 */
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { width, title, tonnage, durationMinutes, exercises, sets, streak },
  ref
) {
  const u = width / 360;
  const height = (width * 16) / 9;
  const now = new Date();
  const date = `${now.getDate()} ${MONTHS[now.getMonth()]}`;

  return (
    // collapsable={false} обов'язково, інакше на Android знімок може вийти порожнім
    <View
      ref={ref}
      collapsable={false}
      style={{
        width,
        height,
        backgroundColor: BG,
        borderRadius: 24 * u,
        overflow: "hidden",
        padding: 28 * u,
      }}
    >
      {/* Фонові кола */}
      <View
        style={{
          position: "absolute",
          top: -90 * u,
          right: -110 * u,
          width: 300 * u,
          height: 300 * u,
          borderRadius: 150 * u,
          backgroundColor: GREEN,
          opacity: 0.16,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -120 * u,
          left: -100 * u,
          width: 280 * u,
          height: 280 * u,
          borderRadius: 140 * u,
          backgroundColor: ORANGE,
          opacity: 0.14,
        }}
      />

      {/* Верх: бренд і дата */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 18 * u,
              height: 18 * u,
              borderRadius: 9 * u,
              borderWidth: 4 * u,
              borderColor: GREEN,
              marginRight: 8 * u,
            }}
          />
          <Text style={{ color: TEXT, fontSize: 20 * u, fontWeight: "800" }}>FitPulse</Text>
        </View>
        <Text style={{ color: MUTED, fontSize: 14 * u }}>{date}</Text>
      </View>

      {/* Назва тренування */}
      <Text
        numberOfLines={3}
        style={{
          color: TEXT,
          fontSize: 30 * u,
          fontWeight: "800",
          lineHeight: 36 * u,
          marginTop: 56 * u,
        }}
      >
        {title || "Тренування"}
      </Text>

      {/* Головне число */}
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ color: MUTED, fontSize: 16 * u, marginBottom: 4 * u }}>
          Піднято за тренування
        </Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{
              color: GREEN,
              fontSize: 76 * u,
              fontWeight: "900",
              lineHeight: 84 * u,
              fontVariant: ["tabular-nums"],
              flexShrink: 1,
            }}
          >
            {spaced(tonnage)}
          </Text>
          <Text
            style={{
              color: TEXT,
              fontSize: 26 * u,
              fontWeight: "700",
              marginLeft: 8 * u,
              marginBottom: 12 * u,
            }}
          >
            кг
          </Text>
        </View>
      </View>

      {/* Статистика */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "#334155",
          paddingTop: 20 * u,
        }}
      >
        <Stat u={u} value={String(durationMinutes)} label="хвилин" />
        <Stat u={u} value={String(exercises)} label={plural(exercises, ["вправа", "вправи", "вправ"])} />
        <Stat u={u} value={String(sets)} label={plural(sets, ["підхід", "підходи", "підходів"])} />
      </View>

      {/* Стрік */}
      <View
        style={{
          marginTop: 24 * u,
          alignSelf: "flex-start",
          backgroundColor: "#1E293B",
          borderRadius: 999,
          paddingVertical: 10 * u,
          paddingHorizontal: 16 * u,
        }}
      >
        <Text style={{ color: ORANGE, fontSize: 16 * u, fontWeight: "700" }}>
          🔥 {streak} {plural(streak, ["день", "дні", "днів"])} поспіль
        </Text>
      </View>
    </View>
  );
});

function Stat({ u, value, label }: { u: number; value: string; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: TEXT, fontSize: 28 * u, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: MUTED, fontSize: 13 * u, marginTop: 2 * u }}>{label}</Text>
    </View>
  );
}