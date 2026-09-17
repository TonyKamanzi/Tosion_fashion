import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const COLUMNS = [
  { heading: "Shop", links: ["New In", "Women", "Men", "Sale"] },
  { heading: "Support", links: ["Shipping", "Returns", "Size Guide", "Contact"] },
  { heading: "Studio", links: ["About", "Journal", "Sustainability", "Careers"] },
];

export default function Footer() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <View className="px-[18px] pt-[34px] pb-[100px]">
      <Text className="font-fraunces-semibold text-[19px] text-ink mb-[10px]">TOSION</Text>
      <Text className="font-sans text-[12.5px] leading-[21px] text-sage mb-[22px]">
        Small-batch clothing made with natural fibres and a longer wear life in mind. Est. 2019.
      </Text>

      {COLUMNS.map((column, index) => {
        const isOpen = open === index;
        return (
          <View key={column.heading} className="border-b border-line">
            <Pressable
              className="flex-row items-center justify-between py-4"
              onPress={() => setOpen(isOpen ? null : index)}
            >
              <Text className="font-inter-medium text-[13.5px] text-ink">
                {column.heading}
              </Text>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={13}
                color="#8B8A7D"
              />
            </Pressable>

            {isOpen && (
              <View className="pb-3">
                {column.links.map((link) => (
                  <Text key={link} className="font-sans text-[13px] text-sage py-2">
                    {link}
                  </Text>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <View className="flex-row justify-between pt-5 mt-[16px]">
        <Text className="font-mono text-[10.5px] text-sage">© 2026 TOSION</Text>
        <Text className="font-mono text-[10.5px] text-sage">Kigali · Lisbon</Text>
      </View>
    </View>
  );
}