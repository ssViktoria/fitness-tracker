import { Text, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & { label: string; error?: string };

export function TextField({ label, error, ...props }: Props) {
  return (
    <View className="mb-4">
      <Text className="mb-1 text-sm font-medium text-text dark:text-text-dark">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        className={`rounded-xl border bg-surface px-4 py-3 text-base text-text dark:bg-surface-dark dark:text-text-dark ${
          error ? "border-danger" : "border-slate-300 dark:border-slate-600"
        }`}
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-sm text-danger">{error}</Text>
      ) : null}
    </View>
  );
}