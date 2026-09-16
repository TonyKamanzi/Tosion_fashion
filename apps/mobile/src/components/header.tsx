import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Header() {
  return (
    <View className="bg-wine px-5 py-4 flex-row items-center justify-between bg-[#F1EDE4] m-5">
      {/* Menu */}
      <Pressable>
        <Ionicons name="menu-outline" size={28} />
      </Pressable>

      {/* Logo / Name */}
      <Text className="text-bone text-2xl font-bold">Tosion</Text>

      {/* Shopping Bag */}
      <Pressable>
        <Ionicons name="bag-outline" size={26} />
      </Pressable>
    </View>
  );
}
