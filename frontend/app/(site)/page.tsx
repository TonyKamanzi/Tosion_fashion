import Category from "@/components/Category";
import Editorial from "@/components/Editorial";
import Hero from "@/components/Hero";
import NewArrivals from "@/components/NewArrivals";
import Newsletter from "@/components/Newsletter";

// hero content is admin-editable, so always render fresh
export const dynamic = "force-dynamic";

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
