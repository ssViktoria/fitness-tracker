import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type Item = { id: string };

type Props<T extends Item> = {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  /** Нова послідовність після відпускання картки */
  onReorder: (next: T[]) => void;
  /** Висота одного елемента разом із відступом між картками */
  itemHeight?: number;
  gap?: number;
};

type Positions = Record<string, number>;

const toPositions = (data: Item[]): Positions =>
  Object.fromEntries(data.map((d, i) => [d.id, i]));

const lightHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

export function DraggableList<T extends Item>({
  data,
  renderItem,
  onReorder,
  itemHeight = 80,
  gap = 8,
}: Props<T>) {
  const slot = itemHeight + gap;
  const positions = useSharedValue<Positions>(toPositions(data));

  // Якщо набір елементів змінився (додали/видалили вправу) — перераховуємо позиції
  const idsKey = data.map((d) => d.id).join("|");
  useEffect(() => {
    positions.value = toPositions(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const finish = (order: Positions) => {
    const next = [...data].sort((a, b) => order[a.id] - order[b.id]);
    if (next.some((item, i) => item.id !== data[i].id)) onReorder(next);
  };

  return (
    <View style={{ height: data.length * slot }}>
      {data.map((item) => (
        <DraggableItem
          key={item.id}
          id={item.id}
          count={data.length}
          slot={slot}
          height={itemHeight}
          positions={positions}
          onDrop={finish}
        >
          {renderItem(item)}
        </DraggableItem>
      ))}
    </View>
  );
}

type ItemProps = {
  id: string;
  count: number;
  slot: number;
  height: number;
  positions: SharedValue<Positions>;
  onDrop: (order: Positions) => void;
  children: React.ReactNode;
};

function DraggableItem({ id, count, slot, height, positions, onDrop, children }: ItemProps) {
  const top = useSharedValue((positions.value[id] ?? 0) * slot);
  const startTop = useSharedValue(0);
  const isActive = useSharedValue(false);
  const lift = useSharedValue(0); // 0 → 1: анімація «підняття» картки

  // Інші картки плавно роз'їжджаються, коли змінюється порядок
  useAnimatedReaction(
    () => positions.value[id],
    (index, prev) => {
      if (index === undefined || index === prev) return;
      if (!isActive.value) top.value = withSpring(index * slot, { damping: 18, stiffness: 200 });
    },
    [slot]
  );

  const longPress = Gesture.LongPress()
    .minDuration(250)
    .maxDistance(10000)
    .onStart(() => {
      isActive.value = true;
      startTop.value = top.value;
      lift.value = withSpring(1);
      runOnJS(lightHaptic)();
    })
    .onFinalize(() => {
      if (isActive.value) {
        isActive.value = false;
        lift.value = withSpring(0);
        top.value = withSpring((positions.value[id] ?? 0) * slot);
        runOnJS(onDrop)(positions.value);
      }
    });

  const pan = Gesture.Pan()
    .manualActivation(true)
    // Pan вмикається лише після довгого натискання
    .onTouchesMove((_e, state) => {
      if (isActive.value) state.activate();
    })
    .onUpdate((e) => {
      if (!isActive.value) return;
      const maxTop = (count - 1) * slot;
      top.value = Math.min(Math.max(startTop.value + e.translationY, 0), maxTop);

      const newIndex = Math.min(Math.max(Math.round(top.value / slot), 0), count - 1);
      const oldIndex = positions.value[id];
      if (newIndex !== oldIndex) {
        const next: Positions = { ...positions.value };
        for (const key in next) {
          if (next[key] === newIndex) next[key] = oldIndex; // міняємось місцями
        }
        next[id] = newIndex;
        positions.value = next;
      }
    });

  const gesture = Gesture.Simultaneous(longPress, pan);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: top.value }, { scale: 1 + lift.value * 0.04 }],
    zIndex: isActive.value ? 10 : 0,
    shadowOpacity: lift.value * 0.35,
    shadowRadius: 4 + lift.value * 10,
    elevation: lift.value * 12,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.item, { height }, style]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  item: {
    position: "absolute",
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
  },
});