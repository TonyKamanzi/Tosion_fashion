import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/shop/CartContext";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <div className="flex flex-col flex-1">
                <Header />
                {children}
                <Footer />
            </div>
        </CartProvider>
    );
}
