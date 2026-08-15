import Category from "@/components/Category";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";

export default function page() {
    return (
        <div className="min-h-screen">
            <Hero />
            <Category />
            <NewArrivals/>
        </div>
    );
}
