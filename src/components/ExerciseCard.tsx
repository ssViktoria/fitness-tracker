import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";

type Props = {
  title: string;
  muscleGroup: string;
  gifUrl: string;
  description: string;
};

const LABELS: Record<string, string> = {
  chest: "Груди", back: "Спина", legs: "Ноги", core: "Прес", arms: "Руки",
};

export function ExerciseCard({ title, muscleGroup, gifUrl, description }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => setOpen((o) => !o)}
      className="mb-3 overflow-hidden rounded-card bg-surface dark:bg-surface-dark"
    >
      <Image
        source={{ uri: gifUrl }}
        style={{ width: "100%", height: 180 }}
        contentFit="contain"
        transition={200}
      />
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 pr-2 text-lg font-bold text-text dark:text-text-dark">
            {title}
          </Text>
          <View className="rounded-full bg-primary/15 px-3 py-1">
            <Text className="text-xs font-semibold text-primary">
              {LABELS[muscleGroup] ?? muscleGroup}
            </Text>
          </View>
        </View>
        <Text
          numberOfLines={open ? undefined : 2}
          className="mt-2 text-text-muted"
        >
          {description}
        </Text>
      </View>
    </Pressable>
  );
}