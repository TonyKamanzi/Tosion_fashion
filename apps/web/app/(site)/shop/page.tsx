import type { Metadata } from "next";
import Link from "next/link";
import axios from "axios";
import ShopListing from "@/components/shop/ShopListing";
import type { ShopProduct } from "@/components/shop/ProductCard";
import type { CategoryCount } from "@/components/shop/ShopSidebar";
import { API_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "New In — Tosion",
};

type ProductsResponse = {
    items: ShopProduct[];
    total: number;
    page: number;
    pages: number;
    limit: number;
};

async function getProducts(): Promise<ProductsResponse> {
    try {
        const res = await axios.get<ProductsResponse>(
            `${API_URL}/products?category=all&limit=100`,
            { timeout: 6000 }
        );
        return res.data;
    } catch {
        return { items: [], total: 0, page: 1, pages: 1, limit: 9 };
    }
}

// shown if the backend is unreachable
const FALLBACK_COUNTS: CategoryCount[] = [];

async function getCounts(): Promise<CategoryCount[]> {
    try {
        const res = await axios.get<CategoryCount[]>(`${API_URL}/products/counts`, {
            timeout: 6000,
        });
        return res.data;
    } catch {
        return FALLBACK_COUNTS;
    }
}

export default async function ShopPage() {
    const [productsData, counts] = await Promise.all([getProducts(), getCounts()]);

    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            {/* page head */}
            <div className="px-[5vw] pt-11 pb-8.5 border-b border-ink/15">
                <p className="font-mono text-[11px] tracking-[0.06em] text-sage mb-5.5">
                    <Link href="/" className="hover:text-wine transition-colors">
                        Home
                    </Link>
                    <span className="mx-2 opacity-50">/</span>
                    <span>New In</span>
                </p>
                <div className="flex justify-between items-end gap-5 flex-wrap">
                    <div>
                        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine block">
                            Autumn / Winter 2026
                        </span>
                        <h1 className="font-display font-medium text-[clamp(38px,4.6vw,60px)] leading-[1.05] tracking-[-0.01em] mt-2.5">
                            New <em className="italic font-normal text-wine">In</em>
                        </h1>
                        <p className="text-sage text-[14px] max-w-[42ch] mt-3 leading-[1.6]">
                            This week&apos;s restock and first looks — updated every Friday, gone
                            once they&apos;re gone.
                        </p>
                    </div>
                    <span className="font-mono text-[12px] text-sage">
                        {productsData.total} {productsData.total === 1 ? "piece" : "pieces"}
                    </span>
                </div>
            </div>

            <ShopListing products={productsData.items} counts={counts} currentSlug="all" />
        </div>
    );
}
