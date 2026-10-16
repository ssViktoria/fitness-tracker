import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";

// Звук завершення відпочинку: assets/sounds/timer-end.wav (корінь проєкту, поруч із src)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const END_SOUND = require("../../assets/sounds/timer-end.wav");

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 220;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PRESETS = [30, 60, 90] as const;

type Phase = "idle" | "running" | "done";

type Props = {
  /** Викликається, коли відпочинок завершився */
  onFinish?: () => void;
  trackColor?: string;
  progressColor?: string;
  textColor?: string;
};

// Вібрація не існує у вебі, тому будь-яку помилку ігноруємо
const buzz = (run: () => Promise<void>) => {
  try {
    run().catch(() => {});
  } catch {}
};

export function RestTimer({
  onFinish,
  trackColor = "#374151",
  progressColor = "#22c55e",
  textColor = "#f9fafb",
}: Props) {
  const player = useAudioPlayer(END_SOUND);

  // 1 = кільце порожнє, 0 = кільце повне. Під час відпочинку 0 → 1 (кільце спорожніє).
  const progress = useSharedValue(1);
  // «Вибух»: пружинна пульсація всього кільця (1.2 → 1.0)
  const scale = useSharedValue(1);
  // Хвиля, що розходиться від кільця (0 → 1)
  const wave = useSharedValue(0);
  // «Вистрибування» напису «Готово!»
  const labelScale = useSharedValue(1);

  const [phase, setPhase] = useState<Phase>("idle");
  const [left, setLeft] = useState(0);
  const endsAt = useRef(0);
  const finished = useRef(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(
    () => () => {
      if (doneTimer.current) clearTimeout(doneTimer.current);
    },
    []
  );

  // Кінець відпочинку: «вибух» масштабу 1.2 → 1.0, хвиля, звук і вібрація
  const finish = useCallback(() => {
    if (finished.current) return; // захист від подвійного виклику
    finished.current = true;

    setPhase("done");
    setLeft(0);

    // кільце на мить знову стає повним, щоб вибух був помітний
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 180 });

    // 1.0 → 1.2 (швидко) → 1.0 (пружина з відскоком)
    cancelAnimation(scale);
    scale.value = withSequence(
      withTiming(1.2, { duration: 140, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 5, stiffness: 170, mass: 0.8 })
    );

    // хвиля, що розходиться
    cancelAnimation(wave);
    wave.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );

    // напис «Готово!» з'являється з відскоком
    cancelAnimation(labelScale);
    labelScale.value = withSequence(
      withTiming(0.5, { duration: 0 }),
      withSpring(1, { damping: 5, stiffness: 220 })
    );

    buzz(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    try {
      player.seekTo(0);
      player.play();
    } catch {}

    onFinishRef.current?.();

    doneTimer.current = setTimeout(() => {
      setPhase("idle");
      progress.value = withTiming(1, { duration: 300 });
    }, 2500);
  }, [player, progress, scale, wave, labelScale]);

  const start = (seconds: number) => {
    if (doneTimer.current) clearTimeout(doneTimer.current);
    finished.current = false;
    cancelAnimation(progress);
    cancelAnimation(scale);
    cancelAnimation(wave);
    scale.value = 1;
    wave.value = 0;
    labelScale.value = 1;
    endsAt.current = Date.now() + seconds * 1000;
    setLeft(seconds);
    setPhase("running");
    // кільце: миттєво повне, потім плавно спорожніє на UI-потоці
    progress.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1, { duration: seconds * 1000, easing: Easing.linear })
    );
    buzz(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  };

  const stop = () => {
    if (doneTimer.current) clearTimeout(doneTimer.current);
    finished.current = false;
    cancelAnimation(progress);
    progress.value = withTiming(1, { duration: 250 });
    setPhase("idle");
    setLeft(0);
  };

  // Цифри та завершення рахуємо за годинником, тому не залежимо від колбеків анімації
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const remaining = Math.ceil((endsAt.current - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(id);
        finish();
      } else {
        setLeft(remaining);
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, finish]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * progress.value,
  }));

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const waveStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wave.value, [0, 0.05, 1], [0, 0.8, 0]),
    transform: [{ scale: interpolate(wave.value, [0, 1], [1, 1.7]) }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: labelScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        {/* Хвиля вибуху (під кільцем) */}
        <Animated.View
          pointerEvents="none"
          style={[styles.wave, { borderColor: progressColor }, waveStyle]}
        />

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

          <Animated.View style={[styles.center, labelStyle]} pointerEvents="none">
            {phase === "running" && (
              <>
                <Text style={[styles.seconds, { color: textColor }]}>{left}</Text>
                <Text style={styles.unit}>сек</Text>
              </>
            )}
            {phase === "done" && (
              <Text style={[styles.word, { color: progressColor }]}>Готово!</Text>
            )}
            {phase === "idle" && (
              <>
                <Text style={[styles.word, { color: textColor }]}>Відпочинок</Text>
                <Text style={styles.unit}>обери час</Text>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </View>

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

      {phase === "running" && (
        <Pressable onPress={stop} style={styles.skip}>
          <Text style={styles.skipText}>Пропустити</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 20, overflow: "visible" },
  stage: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  wave: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
  },
  center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  seconds: { fontSize: 72, fontWeight: "800", fontVariant: ["tabular-nums"], lineHeight: 80 },
  word: { fontSize: 30, fontWeight: "800" },
  unit: { fontSize: 16, color: "#9ca3af", marginTop: 2 },
  buttons: { flexDirection: "row", gap: 12 },
  btn: { backgroundColor: "#22c55e", paddingVertical: 12, paddingHorizontal: 22, borderRadius: 999 },
  btnText: { color: "#052e16", fontWeight: "700", fontSize: 16 },
  skip: { padding: 8 },
  skipText: { color: "#9ca3af", fontSize: 15 },
});