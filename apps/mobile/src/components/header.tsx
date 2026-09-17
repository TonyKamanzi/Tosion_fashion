import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  return (
    <View className="flex-row items-center justify-between bg-[#F1EDE4] px-[18px] py-4 border-b border-line">
      {/* Menu */}
      <Pressable hitSlop={8}>
        <Ionicons name="menu-outline" size={22} color="#191714" />
      </Pressable>

      {/* Logo / Name */}
      <Text className="font-fraunces-semibold text-[19px] text-ink">
        TOSION
      </Text>

      {/* Shopping Bag */}
      <Pressable hitSlop={8} className="relative">
        <Ionicons name="bag-outline" size={21} color="#191714" />
        <Text className="font-mono absolute -top-[7px] -right-[7px] bg-wine text-bone text-[9px] w-[15px] h-[15px] rounded-full text-center leading-[15px]">
          3
        </Text>
      </Pressable>
    </View>
  );
}