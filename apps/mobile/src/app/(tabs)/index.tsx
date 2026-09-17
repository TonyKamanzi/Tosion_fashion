import Header from "@/components/header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import CategoryScroller from "@/components/CategoryScroller";
import ProductGrid from "@/components/ProductGrid";
import Editorial from "@/components/Editorial";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { ScrollView, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 bg-bone">
      <Header />
      <ScrollView>
        <Hero />
        <Marquee />
        <CategoryScroller />
        <ProductGrid />
        <Editorial />
        <Newsletter />
        <Footer />
      </ScrollView>
    </View>
  );
}