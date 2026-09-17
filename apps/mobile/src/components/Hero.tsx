import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

const HERO_IMAGE = require("../../assets/images/placeholders/hero.png");

export default function Hero() {
  return (
    <View className="relative h-[480px] overflow-hidden bg-ink">
      <Image
        source={{ uri: HERO_IMAGE }}
        contentFit="cover"
        transition={300}
        className="absolute inset-0 h-full w-full"
      />
      <LinearGradient
        colors={["rgba(17,17,16,0)", "rgba(17,17,16,0.75)"]}
        locations={[0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute inset-0"
      />

      <View className="absolute left-[22px] right-[22px] bottom-[28px]">
        <Text className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-gold mb-[10px]">
          AW 2026
        </Text>

        <Text className="font-display text-[38px] leading-[40px] text-bone mb-[14px]">
          Cut for{"\n"}
          <Text className="font-fraunces-italic text-wine">quiet</Text> confidence.
        </Text>

        <Text className="font-sans text-[13px] leading-[20px] text-bone/80 mb-[20px] max-w-[240px]">
          Considered silhouettes in natural fibres, made in small batches.
        </Text>

        <Pressable className="bg-bone self-start px-[22px] py-[14px]">
          <Text className="font-inter-medium text-[12.5px] tracking-[0.03em] text-ink">
            Shop the collection →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}