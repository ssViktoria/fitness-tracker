import { Pressable, Text, View } from "react-native";

export function ErrorScreen({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6 dark:bg-background-dark">
      <Text className="mb-2 text-lg font-bold text-danger">Щось пішло не так</Text>
      <Text className="mb-4 text-center text-text-muted">{error.message}</Text>
      <Pressable onPress={retry} className="rounded-xl bg-primary px-6 py-3">
        <Text className="font-semibold text-white">Спробувати ще раз</Text>
      </Pressable>
    </View>
  );
}