import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, ScrollView, Text, View } from "react-native";

const CATEGORIES = [
  { number: "01", label: "Outerwear", image: "https://picsum.photos/id/1011/500/650" },
  { number: "02", label: "Knitwear", image: "https://picsum.photos/id/1012/500/650" },
  { number: "03", label: "Accessories", image: "https://picsum.photos/id/103/500/650" },
];

const { width } = Dimensions.get("window");
const TILE_WIDTH = Math.round(width * 0.66);
const GAP = 12;

export default function CategoryScroller() {
  return (
    <View className="pt-[34px] pb-[6px]">
      <View className="px-[18px] mb-[20px]">
        <Text className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-wine mb-[6px]">
          Shop by
        </Text>
        <Text className="font-display text-[24px] text-ink">Category</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={TILE_WIDTH + GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 4, gap: GAP }}
      >
        {CATEGORIES.map((category) => (
          <View
            key={category.number}
            style={{ width: TILE_WIDTH, aspectRatio: 3 / 4 }}
            className="bg-ink overflow-hidden"
          >
            <Image
              source={{ uri: category.image }}
              contentFit="cover"
              transition={300}
              className="absolute inset-0 h-full w-full"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
              locations={[0.45, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              className="absolute inset-0"
            />
            <View className="absolute left-4 bottom-4">
              <Text className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-gold mb-[5px]">
                {category.number}
              </Text>
              <Text className="font-display text-[19px] text-bone">{category.label}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}