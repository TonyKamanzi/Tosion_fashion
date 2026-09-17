import { useEffect, useState } from "react";
import { Animated, Easing, LayoutChangeEvent, Text, View } from "react-native";

const TICKS = ["FREE SHIPPING $150+", "NEW ARRIVALS WEEKLY", "30-DAY RETURNS"];

function Ticks({ onLayout }: { onLayout?: (event: LayoutChangeEvent) => void }) {
  return (
    <View className="flex-row items-center" onLayout={onLayout}>
      {TICKS.map((tick) => (
        <Text
          key={tick}
          className="font-fraunces-medium-italic text-[14px] text-bone px-4 py-3"
        >
          {tick}
          <Text className="font-mono text-[12px] text-gold"> ✦</Text>
        </Text>
      ))}
    </View>
  );
}

export default function Marquee() {
  const [translateX] = useState(() => new Animated.Value(0));
  const [tickWidth, setTickWidth] = useState(0);

  useEffect(() => {
    if (tickWidth <= 0) return;

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -tickWidth,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [tickWidth, translateX]);

  return (
    <View className="bg-wine overflow-hidden">
      <Animated.View className="flex-row" style={{ transform: [{ translateX }] }}>
        <Ticks onLayout={(event) => setTickWidth(event.nativeEvent.layout.width)} />
        <Ticks />
      </Animated.View>
    </View>
  );
}