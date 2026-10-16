import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../../convex/_generated/api";
import { useTheme } from "@/hooks/useTheme";
import { useSettings } from "@/i18n/SettingsProvider";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Achievements } from "@/components/Achievements";
import { useIsOnline } from "@/components/OfflineBanner";
import { useWeightUnit } from "@/hooks/useWeightUnit";
import { formatWeight, fromUnit, round1, round2, toUnit, unitLabel } from "@/utils/units";
import { hapticError, hapticLight, hapticSelect, hapticSuccess } from "@/utils/haptics";

const num = (s: string) => (s.trim() ? parseFloat(s) : undefined);

function Stat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { primary } = useTheme();
  return (
    <View className="flex-1 items-center rounded-card bg-surface p-3 dark:bg-surface-dark">
      <Ionicons name={icon} size={20} color={primary} />
      <Text className="mt-1 text-lg font-bold text-text dark:text-text-dark">{value}</Text>
      <Text className="text-xs text-text-muted">{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { c, muted, primary } = useTheme();
  const { t, locale } = useSettings();
  const online = useIsOnline();
  const { unit, setUnit } = useWeightUnit();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profile.get);
  const update = useMutation(api.profile.update);
  const generateUploadUrl = useMutation(api.profile.generateUploadUrl);
  const setAvatar = useMutation(api.profile.setAvatar);

  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [sex, setSex] = useState<"male" | "female" | undefined>();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // вага з бази (кг) -> текст у вибраній одиниці
  const weightText = (kg?: number | null) => (kg ? String(round1(toUnit(kg, unit))) : "");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setHeight(profile.heightCm ? String(profile.heightCm) : "");
    setBirthYear(profile.birthYear ? String(profile.birthYear) : "");
    setSex(profile.sex ?? undefined);
  }, [profile?.name, profile?.heightCm, profile?.birthYear, profile?.sex]);

  // вагу перераховуємо при зміні даних або одиниці
  useEffect(() => {
    if (!profile) return;
    setWeight(weightText(profile.weightKg));
  }, [profile?.weightKg, unit]);

  if (profile === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <ActivityIndicator size="large" color={primary} />
      </SafeAreaView>
    );
  }
  if (profile === null) return null;

  const uk = locale.startsWith("uk");

  const dirty =
    name.trim() !== profile.name ||
    weight !== weightText(profile.weightKg) ||
    height !== (profile.heightCm ? String(profile.heightCm) : "") ||
    birthYear !== (profile.birthYear ? String(profile.birthYear) : "") ||
    sex !== (profile.sex ?? undefined);

  const save = async () => {
    if (!online) {
      hapticError();
      return setMsg({ text: t("common.offline"), ok: false });
    }
    const wInput = num(weight);
    const h = num(height);
    const by = num(birthYear);
    if ([wInput, h, by].some((x) => x !== undefined && !Number.isFinite(x))) {
      hapticError();
      return setMsg({ text: t("profile.invalid"), ok: false });
    }
    // у базі вага завжди в кг; 2 знаки, щоб при поверненні у фунти значення не «стрибало»
    const w = wInput === undefined ? undefined : round2(fromUnit(wInput, unit));
    setSaving(true);
    setMsg(null);
    try {
      await update({ name, weightKg: w, heightCm: h, birthYear: by, sex });
      hapticSuccess();
      setMsg({ text: t("common.saved"), ok: true });
    } catch (e) {
      hapticError();
      setMsg({ text: e instanceof Error ? e.message : t("profile.saveFail"), ok: false });
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async () => {
    if (!online) {
      hapticError();
      return setMsg({ text: t("common.offline"), ok: false });
    }
    hapticLight();
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (res.canceled) return;

    setUploading(true);
    setMsg(null);
    try {
      const asset = res.assets[0];
      const blob = await (await fetch(asset.uri)).blob();
      const url = await generateUploadUrl();
      const up = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": asset.mimeType ?? blob.type ?? "image/jpeg" },
        body: blob,
      });
      if (!up.ok) throw new Error(t("profile.photoFail"));
      const { storageId } = await up.json();
      await setAvatar({ storageId });
      hapticSuccess();
    } catch (e) {
      hapticError();
      setMsg({ text: e instanceof Error ? e.message : t("profile.photoFail"), ok: false });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    hapticLight();
    try {
      await setAvatar({ storageId: undefined });
    } catch {
      hapticError();
    }
  };

  const logout = () => {
    hapticLight();
    if (Platform.OS === "web") return void signOut();
    Alert.alert(t("profile.logoutTitle"), undefined, [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.logout"), style: "destructive", onPress: () => void signOut() },
    ]);
  };

  const hours = Math.floor(profile.minutes / 60);
  const mins = profile.minutes % 60;
  const totalTime = hours
    ? `${hours} ${t("unit.h")} ${mins} ${t("unit.min")}`
    : `${mins} ${t("unit.min")}`;
  const since = new Date(profile.since).toLocaleDateString(locale, { month: "long", year: "numeric" });

  const inputClass = "rounded-2xl bg-surface px-5 py-4 text-base dark:bg-surface-dark";
  const labelClass = "mb-1 mt-4 text-sm font-medium text-text dark:text-text-dark";

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark" edges={["top"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32, maxWidth: 760, width: "100%", alignSelf: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6 items-center">
            <Pressable onPress={pickAvatar} disabled={uploading}>
              {profile.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
                  <Text className="text-4xl font-bold text-white">
                    {(profile.name || profile.email || "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {uploading && (
                <View className="absolute inset-0 items-center justify-center rounded-full bg-black/50">
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              <View className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-primary p-1.5 dark:border-background-dark">
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </Pressable>
            {profile.avatarUrl && (
              <Pressable onPress={removeAvatar} hitSlop={8} className="mt-2">
                <Text className="text-xs text-danger">{t("profile.removePhoto")}</Text>
              </Pressable>
            )}
            <Text className="mt-3 text-2xl font-bold text-text dark:text-text-dark">
              {profile.name || t("profile.noName")}
            </Text>
            <Text className="text-text-muted">{profile.email}</Text>
            <Text className="mt-1 text-xs text-text-muted">{t("profile.since", { date: since })}</Text>
          </View>

          <View className="mb-3 flex-row gap-3">
            <Stat icon="flame" label={t("profile.streak")} value={String(profile.streakDays)} />
            <Stat icon="barbell" label={t("profile.workouts")} value={String(profile.workouts)} />
          </View>
          <View className="mb-6 flex-row gap-3">
            <Stat
              icon="trending-up"
              label={t("profile.lifted")}
              value={formatWeight(profile.tonnage, unit, locale)}
            />
            <Stat icon="time" label={t("profile.totalTime")} value={totalTime} />
          </View>

          <Achievements
            stats={{
              workouts: profile.workouts,
              streakDays: profile.streakDays,
              tonnage: profile.tonnage,
              minutes: profile.minutes,
            }}
            unit={unit}
            locale={locale}
          />

          <Text className="mb-3 text-xl font-bold text-text dark:text-text-dark">{t("settings.title")}</Text>
          <SettingsPanel />

          <Text className="mb-2 mt-2 text-sm font-medium text-text dark:text-text-dark">
            {uk ? "Одиниці ваги" : "Weight units"}
          </Text>
          <View className="mb-6 flex-row gap-3">
            {(["kg", "lb"] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => {
                  hapticSelect();
                  setUnit(u);
                  setMsg(null);
                }}
                className={`flex-1 items-center rounded-2xl py-4 ${
                  unit === u ? "bg-primary" : "bg-surface dark:bg-surface-dark"
                }`}
              >
                <Text className={`font-semibold ${unit === u ? "text-white" : "text-text dark:text-text-dark"}`}>
                  {u === "kg"
                    ? uk ? "Кілограми (кг)" : "Kilograms (kg)"
                    : uk ? "Фунти (lb)" : "Pounds (lb)"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-xl font-bold text-text dark:text-text-dark">{t("profile.data")}</Text>

          <Text className={labelClass}>{t("profile.name")}</Text>
          <TextInput
            value={name}
            onChangeText={(v) => { setName(v); setMsg(null); }}
            maxLength={40}
            placeholder={t("profile.namePh")}
            placeholderTextColor={muted}
            className={inputClass}
            style={{ color: c.text }}
          />

          <Text className={labelClass}>
            {t("profile.weight")} ({unitLabel(unit, locale)})
          </Text>
          <TextInput
            value={weight}
            onChangeText={(v) => { setWeight(v.replace(",", ".").replace(/[^0-9.]/g, "")); setMsg(null); }}
            keyboardType="decimal-pad"
            placeholder={t("profile.weightPh")}
            placeholderTextColor={muted}
            className={inputClass}
            style={{ color: c.text }}
          />

          <Text className={labelClass}>{t("profile.height")}</Text>
          <TextInput
            value={height}
            onChangeText={(v) => { setHeight(v.replace(/[^0-9]/g, "")); setMsg(null); }}
            keyboardType="number-pad"
            maxLength={3}
            placeholder={t("profile.heightPh")}
            placeholderTextColor={muted}
            className={inputClass}
            style={{ color: c.text }}
          />

          <Text className={labelClass}>{t("profile.birthYear")}</Text>
          <TextInput
            value={birthYear}
            onChangeText={(v) => { setBirthYear(v.replace(/[^0-9]/g, "")); setMsg(null); }}
            keyboardType="number-pad"
            maxLength={4}
            placeholder={t("profile.birthYearPh")}
            placeholderTextColor={muted}
            className={inputClass}
            style={{ color: c.text }}
          />

          <Text className={labelClass}>{t("profile.sex")}</Text>
          <View className="flex-row gap-3">
            {([["male", t("profile.male")], ["female", t("profile.female")]] as const).map(([key, label]) => (
              <Pressable
                key={key}
                onPress={() => { hapticSelect(); setSex(key); setMsg(null); }}
                className={`flex-1 items-center rounded-2xl py-4 ${
                  sex === key ? "bg-primary" : "bg-surface dark:bg-surface-dark"
                }`}
              >
                <Text className={`font-semibold ${sex === key ? "text-white" : "text-text dark:text-text-dark"}`}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text className="mb-4 mt-2 text-xs text-text-muted">{t("profile.caloriesHint")}</Text>

          {msg && (
            <Text className={`mb-2 text-center ${msg.ok ? "text-primary" : "text-danger"}`}>{msg.text}</Text>
          )}

          <Pressable
            onPress={save}
            disabled={!dirty || saving || !online}
            className={`items-center rounded-2xl bg-primary py-4 ${!dirty || saving || !online ? "opacity-50" : ""}`}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-lg font-bold text-white">{t("common.save")}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={logout}
            className="mt-4 flex-row items-center justify-center rounded-2xl bg-surface py-4 dark:bg-surface-dark"
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text className="ml-2 text-base font-semibold text-danger">{t("common.logout")}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}