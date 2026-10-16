import { useState } from "react";
import { Image, View, type ImageSourcePropType, type StyleProp, type ImageStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EXERCISE_GIFS } from "../constants/exerciseGifs";

/** Локальна гіфка за slug або віддалене посилання. */
export function getGifSource(gifUrl: string): ImageSourcePropType {
  const local = EXERCISE_GIFS[gifUrl];
  return local !== undefined ? local : { uri: gifUrl };
}

type Props = {
  gifUrl?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: "cover" | "contain";
};

/** Анімована ілюстрація вправи; якщо не завантажилась, показує іконку штанги. */
export function ExerciseGif({ gifUrl, style, resizeMode = "contain" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!gifUrl || failed) {
    return (
      <View
        style={[
          { alignItems: "center", justifyContent: "center", backgroundColor: "#0F172A" },
          style as object,
        ]}
      >
        <Ionicons name="barbell-outline" size={28} color="#64748B" />
      </View>
    );
  }

  return (
    <Image
      source={getGifSource(gifUrl)}
      style={style}
      resizeMode={resizeMode}
      onError={() => setFailed(true)}
    />
  );
}
