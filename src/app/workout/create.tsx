import { Text, View } from "react-native";

export default function CreateWorkoutScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
      <Text className="text-xl font-bold text-text dark:text-text-dark">
        Конструктор тренування
      </Text>
    </View>
  );
}