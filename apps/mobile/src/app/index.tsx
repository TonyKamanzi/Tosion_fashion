import Header from "@/components/header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import CategoryScroller from "@/components/CategoryScroller";
import ProductGrid from "@/components/ProductGrid";
import Editorial from "@/components/Editorial";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import TabBar from "@/components/TabBar";
import { ScrollView } from "react-native";

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-bone">
      <Header />
      <Hero />
      <Marquee />
      <CategoryScroller />
      <ProductGrid />
      <Editorial />
      <Newsletter />
      <Footer />
      <TabBar />
    </ScrollView>
  );
}