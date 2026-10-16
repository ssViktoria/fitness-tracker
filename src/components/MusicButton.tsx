import { Linking, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { hapticLight } from "@/utils/haptics";

const SPOTIFY_GREEN = "#1DB954";

// Заміни на свої плейлисти: Spotify → Поділитися → Копіювати посилання
const PLAYLISTS = [
  { label: "Beast Mode", id: "37i9dQZF1DX76Wlfdnj7AP" },
  { label: "Workout", search: "workout" },
  { label: "Gym Hits", search: "gym hits" },
] as const;

async function open(item: (typeof PLAYLISTS)[number]) {
  hapticLight();
  const web =
    "id" in item
      ? `https://open.spotify.com/playlist/${item.id}`
      : `https://open.spotify.com/search/${encodeURIComponent(item.search)}`;
  const native =
    "id" in item
      ? `spotify:playlist:${item.id}`
      : `spotify:search:${encodeURIComponent(item.search)}`;

  if (Platform.OS === "web") return void Linking.openURL(web);
  try {
    await Linking.openURL(native); // відкриває застосунок Spotify
  } catch {
    Linking.openURL(web); // Spotify не встановлено, відкриється браузер
  }
}

export function MusicButton() {
  return (
    <View className="mb-2">
      <View className="mx-4 mb-2 flex-row items-center">
        <Ionicons name="musical-notes" size={18} color={SPOTIFY_GREEN} />
        <Text className="ml-2 text-sm font-semibold text-text-muted">Музика для тренування</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {PLAYLISTS.map((p) => (
          <Pressable
            key={p.label}
            onPress={() => open(p)}
            className="flex-row items-center rounded-full bg-surface px-4 py-2.5 dark:bg-surface-dark"
          >
            <Ionicons name="play-circle" size={20} color={SPOTIFY_GREEN} />
            <Text className="ml-2 font-semibold text-text dark:text-text-dark">{p.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}