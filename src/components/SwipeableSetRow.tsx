import React from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

const THRESHOLD = 80;
const MAX_DRAG = 140;

type Props = {
  children: React.ReactNode;
  /** Підхід уже виконано (рядок лишається підсвіченим зеленим) */
  completed?: boolean;
  /** Викликається, коли користувач протягнув рядок далі 80px і відпустив */
  onComplete: () => void;
};

const impact = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

export function SwipeableSetRow({ children, completed = false, onComplete }: Props) {
  const translateX = useSharedValue(0);
  const passed = useSharedValue(false);

  const pan = Gesture.Pan()
    // горизонтальний жест не конфліктує зі скролом списку
    .activeOffsetX([10, 10000])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      const x = Math.min(Math.max(e.translationX, 0), MAX_DRAG);
      translateX.value = x;
      if (x >= THRESHOLD && !passed.value) {
        passed.value = true;
        runOnJS(impact)(); // вібрація в момент перетину порога
      } else if (x < THRESHOLD && passed.value) {
        passed.value = false;
      }
    })
    .onEnd(() => {
      if (translateX.value >= THRESHOLD) {
        runOnJS(onComplete)();
      }
      translateX.value = withSpring(0, { damping: 14, stiffness: 180 });
      passed.value = false;
    });

  // Зелений фон під рядком
  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [0, THRESHOLD],
      ["rgba(34,197,94,0)", "rgba(34,197,94,1)"]
    ),
  }));

  // Іконка галочки з'являється разом зі свайпом
  const checkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, THRESHOLD], [0, 1], "clamp"),
    transform: [
      { scale: interpolate(translateX.value, [20, THRESHOLD], [0.5, 1], "clamp") },
    ],
  }));

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.bg, bgStyle]}>
        <Animated.View style={checkStyle}>
          <Ionicons name="checkmark-circle" size={28} color="#fff" />
        </Animated.View>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.row, completed && styles.rowDone, rowStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 12, overflow: "hidden", marginVertical: 4 },
  bg: { justifyContent: "center", paddingLeft: 16, borderRadius: 12 },
  row: { backgroundColor: "#1f2937", borderRadius: 12 },
  rowDone: { backgroundColor: "#14532d" },
});