import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
      <Text className="text-xl font-bold text-text dark:text-text-dark">
        Тренування {id}
      </Text>
    </View>
  );
}