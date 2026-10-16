import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const COLORS = ["#22C55E", "#F97316", "#FACC15", "#38BDF8", "#F472B6", "#A78BFA"];

type Piece = {
  vx: number; // горизонтальний розліт, px
  vy: number; // початкова швидкість вгору, px (від'ємна)
  g: number; // «гравітація», px
  rot: number; // обертання в площині, deg
  flip: number; // перевертання (rotateX), deg
  delay: number;
  duration: number;
  w: number;
  h: number;
  color: string;
  round: boolean;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function makePiece(screenW: number): Piece {
  const round = Math.random() < 0.25;
  const size = rand(7, 13);
  return {
    vx: rand(-0.55, 0.55) * screenW,
    vy: -rand(260, 620),
    g: rand(900, 1400),
    rot: rand(-900, 900),
    flip: rand(-720, 720),
    delay: rand(0, 180),
    duration: rand(2200, 3000),
    w: size,
    h: round ? size : size * rand(1.4, 2.2),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    round,
  };
}

function ConfettiPiece({
  cfg,
  originX,
  originY,
}: {
  cfg: Piece;
  originX: number;
  originY: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    // t: 0 → 1 лінійно, а траєкторію (політ угору і падіння) рахуємо формулою нижче
    t.value = withDelay(
      cfg.delay,
      withTiming(1, { duration: cfg.duration, easing: Easing.linear })
    );
  }, [cfg, t]);

  const style = useAnimatedStyle(() => {
    const p = t.value;
    return {
      opacity: interpolate(p, [0, 0.06, 0.75, 1], [0, 1, 1, 0]),
      transform: [
        { perspective: 500 },
        { translateX: cfg.vx * p },
        { translateY: cfg.vy * p + cfg.g * p * p },
        { rotate: `${cfg.rot * p}deg` },
        { rotateX: `${cfg.flip * p}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: originX - cfg.w / 2,
          top: originY,
          width: cfg.w,
          height: cfg.h,
          backgroundColor: cfg.color,
          borderRadius: cfg.round ? cfg.w / 2 : 2,
        },
        style,
      ]}
    />
  );
}

type Props = {
  /** Кількість часток */
  count?: number;
  /** Де вибухає: частка висоти екрана зверху (0..1) */
  originY?: number;
  /** Викликається, коли остання частка зникла */
  onDone?: () => void;
};

/**
 * Конфеті-салют. Монтуйте компонент, коли треба запустити ефект,
 * а щоб повторити, змініть його key.
 */
export function Confetti({ count = 70, originY = 0.32, onDone }: Props) {
  const { width, height } = useWindowDimensions();

  const pieces = useMemo(
    () => Array.from({ length: count }, () => makePiece(width)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count]
  );

  useEffect(() => {
    if (!onDone) return;
    const total = Math.max(...pieces.map((p) => p.delay + p.duration)) + 80;
    const id = setTimeout(onDone, total);
    return () => clearTimeout(id);
  }, [pieces, onDone]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((cfg, i) => (
        <ConfettiPiece key={i} cfg={cfg} originX={width / 2} originY={height * originY} />
      ))}
    </View>
  );
}