import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Dimensions, Text, View } from "react-native";

const PRODUCTS = [
  { name: "Wool Overcoat", category: "Outerwear", price: "$328", tag: "NEW", image: require("../../assets/images/placeholders/product-wool-overcoat.png") },
  { name: "Ribbed Knit Sweater", category: "Knitwear", price: "$148", tag: null, image: require("../../assets/images/placeholders/product-ribbed-knit.png") },
  { name: "Tailored Trousers", category: "Bottoms", price: "$168", tag: "−20%", image: require("../../assets/images/placeholders/product-tailored-trousers.png") },
  { name: "Leather Crossbody", category: "Accessories", price: "$212", tag: null, image: require("../../assets/images/placeholders/product-leather-crossbody.png") },
];

const { width } = Dimensions.get("window");
const PADDING = 18;
const GAP = 10;
const CARD_WIDTH = Math.round((width - PADDING * 2 - GAP) / 2);

export default function ProductGrid() {
  return (
    <View className="pt-[34px] px-[18px]">
      <View className="mb-[20px]">
        <Text className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-wine mb-[6px]">
          This week
        </Text>
        <Text className="font-display text-[24px] text-ink">New arrivals</Text>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: GAP }}>
        {PRODUCTS.map((product) => (
          <View
            key={product.name}
            style={{ width: CARD_WIDTH }}
            className="mb-[14px]"
          >
            <View className="relative bg-bone-2 mb-[10px] overflow-hidden" style={{ aspectRatio: 3 / 4 }}>
              {product.tag && (
                <Text className="font-mono absolute top-2 left-2 z-[2] bg-wine text-bone text-[9px] tracking-[0.04em] px-[7px] py-[4px]">
                  {product.tag}
                </Text>
              )}
              <View className="absolute top-2 right-2 z-[2] w-[26px] h-[26px] rounded-full bg-bone/90 items-center justify-center">
                <Ionicons name="heart-outline" size={13} color="#191714" />
              </View>
              <Image
                source={product.image}
                contentFit="cover"
                transition={300}
                className="absolute inset-0 h-full w-full"
              />
            </View>

            <Text className="font-inter-medium text-[12.5px] text-ink mb-[3px]">
              {product.name}
            </Text>
            <Text className="font-sans text-[10.5px] text-sage mb-[4px]">
              {product.category}
            </Text>
            <Text className="font-mono text-[12px] text-ink">{product.price}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}