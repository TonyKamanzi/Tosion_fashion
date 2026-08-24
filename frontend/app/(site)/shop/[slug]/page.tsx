import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import axios from "axios";
import ShopListing from "@/components/shop/ShopListing";
import type { ShopProduct } from "@/components/shop/ProductCard";
import type { CategoryCount } from "@/components/shop/ShopSidebar";

export const dynamic = "force-dynamic";

type ShopCategoryPageProps = {
    params: Promise<{ slug: string }>;
};

type CategoryDoc = {
    _id: string;
    label: string;
    slug: string;
    eyebrow: string;
    description?: string;
    enabled: boolean;
};

type ProductsResponse = {
    items: ShopProduct[];
    total: number;
    page: number;
    pages: number;
    limit: number;
};

async function getCategory(slug: string): Promise<CategoryDoc | null> {
    try {
        const res = await axios.get<CategoryDoc[]>("http://localhost:2000/categories", {
            timeout: 6000,
        });
        return res.data.find((cat) => cat.slug === slug) ?? null;
    } catch {
        return null;
    }
}

async function getProducts(slug: string): Promise<ProductsResponse> {
    try {
        const res = await axios.get<ProductsResponse>(
            `http://localhost:2000/products?category=${encodeURIComponent(slug)}&limit=100`,
            { timeout: 6000 }
        );
        return res.data;
    } catch {
        return { items: [], total: 0, page: 1, pages: 1, limit: 9 };
    }
}

async function getCounts(): Promise<CategoryCount[]> {
    try {
        const res = await axios.get<CategoryCount[]>("http://localhost:2000/products/counts", {
            timeout: 6000,
        });
        return res.data;
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: ShopCategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategory(slug);
    return { title: `${category ? category.label : "Shop"} — Tosion` };
}

export default async function ShopCategoryPage({ params }: ShopCategoryPageProps) {
    const { slug } = await params;
    const [category, productsData, counts] = await Promise.all([
        getCategory(slug),
        getProducts(slug),
        getCounts(),
    ]);

    // unknown category slug → 404
    if (!category) notFound();

    // "Winter Knits" -> "Winter <em>Knits</em>" like the template's h1
    const words = category.label.split(" ");
    const lastWord = words.pop() ?? "";
    const head = words.length > 0 ? `${words.join(" ")} ` : "";

    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            {/* page head */}
            <div className="px-[5vw] pt-11 pb-8.5 border-b border-ink/15">
                <p className="font-mono text-[11px] tracking-[0.06em] text-sage mb-5.5">
                    <Link href="/" className="hover:text-wine transition-colors">
                        Home
                    </Link>
                    <span className="mx-2 opacity-50">/</span>
                    <Link href="/shop" className="hover:text-wine transition-colors">
                        New In
                    </Link>
                    <span className="mx-2 opacity-50">/</span>
                    <span>{category.label}</span>
                </p>
                <div className="flex justify-between items-end gap-5 flex-wrap">
                    <div>
                        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine block">
                            {category.eyebrow || "Collection"}
                        </span>
                        <h1 className="font-display font-medium text-[clamp(38px,4.6vw,60px)] leading-[1.05] tracking-[-0.01em] mt-2.5">
                            {head}
                            <em className="italic font-normal text-wine">{lastWord}</em>
                        </h1>
                        {(category.description ?? "").trim() !== "" && (
                            <p className="text-sage text-[14px] max-w-[42ch] mt-3 leading-[1.6]">
                                {category.description}
                            </p>
                        )}
                    </div>
                    <span className="font-mono text-[12px] text-sage">
                        {productsData.total} {productsData.total === 1 ? "piece" : "pieces"}
                    </span>
                </div>
            </div>

            <ShopListing
                products={productsData.items}
                counts={counts}
                currentSlug={category.slug}
            />
        </div>
    );
}
