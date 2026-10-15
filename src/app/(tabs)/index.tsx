import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileCard } from "../../components/ProfileCard";
import { TodayPlanCard } from "../../components/TodayPlanCard";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <View style={{ flex: 1, width: "100%", maxWidth: 760, alignSelf: "center" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16, gap: 20 }}
        >
          <View className="mx-4">
            <ProfileCard />
          </View>
          <TodayPlanCard />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}