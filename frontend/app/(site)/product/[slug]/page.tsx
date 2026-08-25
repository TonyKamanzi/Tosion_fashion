import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import axios from "axios";
import ProductDetail, { type ProductDoc } from "@/components/shop/ProductDetail";
import ProductCard from "@/components/shop/ProductCard";
import type { ShopProduct } from "@/components/shop/ProductCard";

export const dynamic = "force-dynamic";

type ProductPageProps = {
    params: Promise<{ slug: string }>;
};

async function getProduct(slug: string): Promise<ProductDoc | null> {
    try {
        const res = await axios.get<ProductDoc>(`http://localhost:2000/products/${slug}`, {
            timeout: 6000,
        });
        return res.data;
    } catch {
        return null;
    }
}

async function getRelated(slug: string): Promise<ShopProduct[]> {
    try {
        const res = await axios.get<ShopProduct[]>(
            `http://localhost:2000/products/related/${slug}`,
            { timeout: 6000 },
        );
        return res.data;
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);
    return { title: product ? `${product.name} — Tosion` : "Product — Tosion" };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const [product, related] = await Promise.all([getProduct(slug), getRelated(slug)]);

    if (!product) notFound();

    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            {/* breadcrumb */}
            <div className="px-[5vw] pt-6 pb-0 font-mono text-[11px] tracking-[0.06em] text-sage">
                <Link href="/" className="hover:text-wine transition-colors">
                    Home
                </Link>
                <span className="mx-2 opacity-50">/</span>
                <Link href="/shop" className="hover:text-wine transition-colors">
                    New In
                </Link>
                {product.category && (
                    <>
                        <span className="mx-2 opacity-50">/</span>
                        <Link
                            href={`/shop/${product.category.slug}`}
                            className="hover:text-wine transition-colors"
                        >
                            {product.category.label}
                        </Link>
                    </>
                )}
                <span className="mx-2 opacity-50">/</span>
                <span>{product.name}</span>
            </div>

            {/* product detail */}
            <ProductDetail product={product} />

            {/* you may also like */}
            {related.length > 0 && (
                <section className="px-[5vw] pb-[100px]">
                    <div className="flex justify-between items-end mb-11 flex-wrap gap-4">
                        <h2 className="font-display font-medium text-[clamp(28px,3.2vw,42px)] leading-[1.05] tracking-[-0.01em]">
                            You may also{" "}
                            <em className="italic font-normal text-wine">like</em>
                        </h2>
                        <Link
                            href="/shop"
                            className="font-mono text-[11px] text-wine underline underline-offset-[3px]"
                        >
                            View all →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 min-[900px]:grid-cols-4 gap-x-6.5 gap-y-9">
                        {related.map((item) => (
                            <ProductCard key={item._id} product={item} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
