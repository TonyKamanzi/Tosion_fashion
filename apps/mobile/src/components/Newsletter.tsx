import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <View className="bg-bone-2 px-[18px] py-9 border-y border-line">
      <Text className="font-display text-[22px] text-ink mb-[16px]">
        Get first access to new drops.
      </Text>

      <View className="flex-row items-center border-b border-ink pb-[10px]">
        <TextInput
          placeholder="Your email address"
          placeholderTextColor="#8B8A7D"
          keyboardType="email-address"
          autoCapitalize="none"
          className="flex-1 font-sans text-[14px] text-ink py-0"
        />
        <Pressable onPress={() => setSubscribed(true)} hitSlop={8}>
          <Text className="font-mono text-[11px] text-wine">
            {subscribed ? "Subscribed ✓" : "Join →"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}