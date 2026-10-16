import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { EXERCISE_GIFS } from "../constants/exerciseGifs";

type Props = {
  title: string;
  muscleGroup: string;
  gifUrl: string;
  description: string;
};

const LABELS: Record<string, string> = {
  chest: "Груди", back: "Спина", legs: "Ноги", core: "Прес", arms: "Руки",
};

const GIF_HEIGHT = 240;
const GIF_SCALE = 1.25;

export function ExerciseCard({ title, muscleGroup, gifUrl, description }: Props) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  const source = EXERCISE_GIFS[gifUrl] ?? { uri: gifUrl };

  return (
    <Pressable
      onPress={() => setOpen((o) => !o)}
      className="mb-3 overflow-hidden rounded-card bg-surface dark:bg-surface-dark"
    >
      <View
        style={{
          width: "100%",
          height: GIF_HEIGHT,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {failed ? (
          <Ionicons name="barbell-outline" size={48} color="#64748B" />
        ) : (
          <Image
            source={source}
            style={{
              width: "100%",
              height: "100%",
              transform: [{ scale: GIF_SCALE }],
            }}
            contentFit="contain"
            transition={200}
            onError={() => setFailed(true)}
          />
        )}
      </View>

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