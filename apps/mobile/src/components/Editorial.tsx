import { Image } from "expo-image";
import { Text, View } from "react-native";

export default function Editorial() {
  return (
    <View className="relative bg-ink items-center justify-center py-[68px] overflow-hidden">
      <Image
        source={{ uri: "https://picsum.photos/id/1062/780/700" }}
        contentFit="cover"
        transition={300}
        className="absolute inset-0 h-full w-full opacity-40"
      />

      <View className="px-[30px] items-center">
        <Text className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-gold mb-[16px]">
          The Journal
        </Text>
        <Text className="font-fraunces-regular text-[21px] italic leading-[29px] text-bone text-center">
          “Choosing pieces that earn their place.”
        </Text>
        <Text className="font-mono text-[10.5px] text-sage mt-[18px]">
          — Studio notes, AW26
        </Text>
      </View>
    </View>
  );
}