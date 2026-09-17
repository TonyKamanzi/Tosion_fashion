import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "expo-router/js-tabs";

type IconName = ComponentProps<typeof Ionicons>["name"];

const TAB_META: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  index: { label: "Home", icon: "home-outline", activeIcon: "home" },
  search: { label: "Search", icon: "search-outline", activeIcon: "search" },
  bag: { label: "Bag", icon: "bag-outline", activeIcon: "bag" },
  account: { label: "Account", icon: "person-outline", activeIcon: "person" },
};

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row bg-[#F1EDE4]/95 border-t border-line pt-[10px]"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {state.routes.map((route, index) => {
        const isActive = state.index === index;
        const meta = TAB_META[route.name] ?? {
          label: descriptors[route.key]?.options.title ?? route.name,
          icon: "ellipse-outline",
          activeIcon: "ellipse-outline",
        };
        const color = isActive ? "#5C1A21" : "#8B8A7D";

        return (
          <Pressable
            key={route.key}
            className="flex-1 items-center gap-[2px]"
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isActive && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
          >
            <Ionicons name={isActive ? meta.activeIcon : meta.icon} size={18} color={color} />
            <Text
              className={`font-mono text-[9.5px] tracking-[0.03em] ${
                isActive ? "text-wine" : "text-sage"
              }`}
            >
              {meta.label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}