import { Text, View } from "react-native";

export default function WorkoutsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
      <Text className="text-xl font-bold text-text dark:text-text-dark">
        Каталог вправ
      </Text>
    </View>
  );
}