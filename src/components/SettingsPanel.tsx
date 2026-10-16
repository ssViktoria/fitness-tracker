import { Pressable, Text, View } from "react-native";
import { useSettings, type ThemeMode } from "@/i18n/SettingsProvider";
import type { Lang } from "@/i18n/translations";
import { hapticSelect } from "@/utils/haptics";

function Segment<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row rounded-xl bg-surface p-1 dark:bg-surface-dark">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => {
              hapticSelect();
              onChange(o.key);
            }}
            className={`flex-1 items-center rounded-lg py-2.5 ${active ? "bg-primary" : ""}`}
          >
            <Text className={`font-semibold ${active ? "text-white" : "text-text-muted"}`}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SettingsPanel() {
  const { mode, setMode, lang, setLang, t } = useSettings();

  return (
    <View className="mb-6">
      <Text className="mb-1 text-sm font-medium text-text dark:text-text-dark">{t("settings.theme")}</Text>
      <Segment<ThemeMode>
        value={mode}
        onChange={setMode}
        options={[
          { key: "system", label: t("settings.themeSystem") },
          { key: "light", label: t("settings.themeLight") },
          { key: "dark", label: t("settings.themeDark") },
        ]}
      />
      <Text className="mb-1 mt-4 text-sm font-medium text-text dark:text-text-dark">{t("settings.language")}</Text>
      <Segment<Lang>
        value={lang}
        onChange={setLang}
        options={[
          { key: "uk", label: "Українська" },
          { key: "en", label: "English" },
        ]}
      />
    </View>
  );
}