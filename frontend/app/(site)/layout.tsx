import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/shop/CartContext";
import { WishlistProvider } from "@/components/shop/WishlistContext";
import { CustomerSessionProvider } from "@/components/shop/CustomerSessionContext";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <CustomerSessionProvider>
            <CartProvider>
                <WishlistProvider>
                    <div className="flex flex-col flex-1">
                        <Header />
                        {children}
                        <Footer />
                    </div>
                </WishlistProvider>
            </CartProvider>
        </CustomerSessionProvider>
    );
}
