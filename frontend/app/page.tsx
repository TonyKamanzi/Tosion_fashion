import Category from "@/components/Category";
import Editorial from "@/components/Editorial";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";
import Newsletter from "@/components/Newsletter";

export default function page() {
    return (
        <div className="min-h-screen">
            <Hero />
            <Category />
            <NewArrivals />
            <Editorial />
            <Newsletter />
        </div>
    );
}
