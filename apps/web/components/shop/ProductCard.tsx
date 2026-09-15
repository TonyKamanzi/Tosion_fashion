"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";

export type ShopProduct = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string;
    imageAltUrl: string;
    imageAlt: string;
    tag: string;
    sizes: string[];
    colors: { name: string; hex: string }[];
    department: string;
    category: { _id: string; label: string; slug: string } | null;
};

type ProductCardProps = {
    product: ShopProduct;
    view?: "grid" | "list";
};

// "$328" / "$1,240" without decimals
function formatPrice(value: number) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function ProductCard({ product, view = "grid" }: ProductCardProps) {
    const hasAlt = Boolean(product.imageAltUrl);
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const saved = isInWishlist(product._id);

    const media = (
        <Link
            href={`/product/${product.slug}`}
            className={`block relative overflow-hidden bg-bone-2 ${
                view === "grid" ? "aspect-3/4 mb-4" : "aspect-3/4 w-32 shrink-0 sm:w-40"
            }`}
        >
            {product.tag && (
                <span className="absolute z-10 top-3.5 -right-px bg-wine text-bone font-mono text-[11px] tracking-[0.05em] px-2.5 py-1.5 before:absolute before:content-[''] before:top-0 before:-left-2.25 before:border-solid before:border-[14.5px_9px_14.5px_0] before:border-transparent before:border-r-wine">
                    {product.tag}
                </span>
            )}

            {/* wishlist heart */}
            <button
                type="button"
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist({
                        _id: product._id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        imageAltUrl: product.imageAltUrl,
                        category: product.category,
                    });
                }}
                className={`absolute z-10 top-3 left-3 w-8 h-8 rounded-full bg-bone/90 flex items-center justify-center opacity-0 -translate-y-1 transition-all duration-250 group-hover:opacity-100 group-hover:translate-y-0 cursor-pointer pointer-events-auto ${
                    saved ? "text-wine opacity-100 translate-y-0" : "text-ink hover:text-wine"
                }`}
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
            </button>

            {/* main + alt images swap on hover, like the template */}
            <Image
                src={product.imageUrl || "https://picsum.photos/600/800"}
                alt={product.imageAlt || product.name}
                fill
                sizes={view === "grid" ? "(min-width: 900px) 25vw, 50vw" : "160px"}
                className={`object-cover transition-all duration-600 ease-[cubic-bezier(.2,.8,.2,1)] ${
                    hasAlt ? "group-hover:opacity-0" : "group-hover:scale-[1.06]"
                }`}
            />
            {hasAlt && (
                <Image
                    src={product.imageAltUrl}
                    alt={`${product.imageAlt || product.name} — alternate view`}
                    fill
                    sizes={view === "grid" ? "(min-width: 900px) 25vw, 50vw" : "160px"}
                    className="absolute inset-0 object-cover opacity-0 transition-all duration-600 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:opacity-100 group-hover:scale-[1.06]"
                />
            )}

            {/* quick add */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                        _id: product._id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        imageAltUrl: product.imageAltUrl,
                        category: product.category,
                        selectedColor: product.colors.length > 0 ? product.colors[0] : null,
                        selectedSize: product.sizes.length > 0 ? product.sizes[0] : "",
                        qty: 1,
                    });
                }}
                className="absolute left-3 right-3 bottom-3 bg-bone text-ink text-center py-3 font-mono text-[11px] tracking-[0.08em] uppercase opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 cursor-pointer"
            >
                Quick add
            </button>
        </Link>
    );

    const info = (
        <div className={view === "list" ? "flex-1 min-w-0" : undefined}>
            <div className="flex justify-between items-start gap-2.5">
                <div className="min-w-0">
                    <h4 className="font-sans font-medium text-[14.5px] mb-1 truncate">
                        {product.name}
                    </h4>
                    {view === "list" && product.description && (
                        <p className="text-[13px] text-sage leading-[1.6] line-clamp-2 mb-1.5">
                            {product.description}
                        </p>
                    )}
                    <span className="block text-[12px] text-sage">
                        {product.sizes.length > 0 && (
                            <span className="mr-2.5">{product.sizes.join(" · ")}</span>
                        )}
                    </span>
                    {product.colors.length > 0 && (
                        <div className="flex gap-1.5 mt-2.5">
                            {product.colors.map((color, i) => (
                                <span
                                    key={`${color.hex}-${i}`}
                                    title={color.name || color.hex}
                                    className="w-3 h-3 rounded-full border border-ink/15 inline-block"
                                    style={{ backgroundColor: color.hex }}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <span className="font-mono text-[13px] text-right shrink-0">
                    {product.compareAtPrice !== null && product.compareAtPrice > product.price && (
                        <span className="block text-sage line-through text-[11px] mb-0.5">
                            {formatPrice(product.compareAtPrice)}
                        </span>
                    )}
                    {formatPrice(product.price)}
                </span>
            </div>
        </div>
    );

    if (view === "list") {
        return (
            <article className="group flex gap-5 items-start pb-6 border-b border-ink/10 last:border-b-0">
                {media}
                {info}
            </article>
        );
    }

    return (
        <article className="group relative">
            {media}
            {info}
        </article>
    );
}
