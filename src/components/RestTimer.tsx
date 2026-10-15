import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";

// Звук лежить у assets/sounds/timer-end.wav (корінь проєкту, поруч із src)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const END_SOUND = require("../../assets/sounds/timer-end.wav");

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 220;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PRESETS = [30, 60, 90] as const;

type Props = {
  /** Викликається, коли відпочинок завершився */
  onFinish?: () => void;
  trackColor?: string;
  progressColor?: string;
  textColor?: string;
};

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.max(s, 0) % 60).padStart(2, "0")}`;

export function RestTimer({
  onFinish,
  trackColor = "#374151",
  progressColor = "#22c55e",
  textColor = "#f9fafb",
}: Props) {
  const player = useAudioPlayer(END_SOUND);
  const progress = useSharedValue(0); // 0 → 1
  const scale = useSharedValue(1);
  const [total, setTotal] = useState(0);
  const [left, setLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const endsAt = useRef(0);

  // 6.5: звук + вібрація + «вибух» масштабу 1.2 → 1.0
  const handleFinished = useCallback(() => {
    setRunning(false);
    setLeft(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      player.seekTo(0);
      player.play();
    } catch {}
    onFinish?.();
  }, [player, onFinish]);

  const start = (seconds: number) => {
    cancelAnimation(progress);
    progress.value = 0;
    scale.value = 1;
    setTotal(seconds);
    setLeft(seconds);
    setRunning(true);
    endsAt.current = Date.now() + seconds * 1000;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // 6.3: прогрес 0 → 1 повністю на UI-потоці
    progress.value = withTiming(
      1,
      { duration: seconds * 1000, easing: Easing.linear },
      (finished) => {
        if (!finished) return;
        scale.value = withSequence(
          withTiming(1.2, { duration: 120 }),
          withSpring(1, { damping: 6, stiffness: 200 })
        );
        runOnJS(handleFinished)();
      }
    );
  };

  const stop = () => {
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 250 });
    setRunning(false);
    setLeft(0);
  };

  // Цифри оновлюємо в JS раз на 250 мс — на плавність кільця це не впливає
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft(Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000)));
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * progress.value,
  }));

  const wrapStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ringWrap, wrapStyle]}>
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={trackColor}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={progressColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            fill="none"
            animatedProps={ringProps}
          />
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={[styles.time, { color: textColor }]}>
            {running || left > 0 ? fmt(left) : total ? "Готово!" : "Відпочинок"}
          </Text>
        </View>
      </Animated.View>

      {/* 6.4: кнопки швидкого старту */}
      <View style={styles.buttons}>
        {PRESETS.map((s) => (
          <Pressable
            key={s}
            onPress={() => start(s)}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.btnText}>{s} с</Text>
          </Pressable>
        ))}
      </View>

      {running && (
        <Pressable onPress={stop} style={styles.skip}>
          <Text style={styles.skipText}>Пропустити</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 20 },
  ringWrap: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  time: { fontSize: 44, fontWeight: "700", fontVariant: ["tabular-nums"] },
  buttons: { flexDirection: "row", gap: 12 },
  btn: { backgroundColor: "#22c55e", paddingVertical: 12, paddingHorizontal: 22, borderRadius: 999 },
  btnText: { color: "#052e16", fontWeight: "700", fontSize: 16 },
  skip: { padding: 8 },
  skipText: { color: "#9ca3af", fontSize: 15 },
});