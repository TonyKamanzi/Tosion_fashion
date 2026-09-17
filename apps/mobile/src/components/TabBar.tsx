import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

const TABS = [
  { label: "Home", icon: "home-outline", active: true },
  { label: "Search", icon: "search-outline", active: false },
  { label: "Bag", icon: "bag-outline", active: false },
  { label: "Account", icon: "person-outline", active: false },
] as const;

export default function TabBar() {
  return (
    <View className="flex-row bg-[#F1EDE4]/95 border-t border-line px-0 pt-[10px] pb-2">
      {TABS.map((tab) => (
        <View key={tab.label} className="flex-1 items-center gap-[4px]">
          <Ionicons
            name={tab.icon}
            size={18}
            color={tab.active ? "#5C1A21" : "#8B8A7D"}
          />
          <Text
            className={`font-mono text-[9.5px] tracking-[0.03em] ${
              tab.active ? "text-wine" : "text-sage"
            }`}
          >
            {tab.label.toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
  );
}