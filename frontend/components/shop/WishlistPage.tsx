"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist, type WishlistItem } from "./WishlistContext";

function formatPrice(value: number) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function WishlistCard({ item }: { item: WishlistItem }) {
    const { removeFromWishlist, moveToBag } = useWishlist();
    return (
        <article className="group">
            <Link href={`/product/${item.slug}`} className="block relative aspect-3/4 overflow-hidden bg-bone-2 mb-4">
                <Image
                    src={item.imageUrl || "https://picsum.photos/600/800"}
                    alt={item.name}
                    fill
                    sizes="(min-width: 900px) 25vw, 50vw"
                    className="object-cover transition-transform duration-600 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-106"
                />
                {/* remove from wishlist */}
                <button
                    type="button"
                    aria-label="Remove from wishlist"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(item._id);
                    }}
                    className="absolute z-10 top-3 left-3 w-8 h-8 rounded-full bg-bone/90 flex items-center justify-center text-wine opacity-0 -translate-y-1 transition-all duration-250 group-hover:opacity-100 group-hover:translate-y-0 cursor-pointer pointer-events-auto"
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                </button>
                {/* move to bag overlay */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        moveToBag(item);
                    }}
                    className="absolute left-3 right-3 bottom-3 bg-bone text-ink text-center py-3 font-mono text-[11px] tracking-[0.08em] uppercase opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 cursor-pointer"
                >
                    Move to bag
                </button>
            </Link>
            <Link href={`/product/${item.slug}`}>
                <h4 className="font-sans font-medium text-[14.5px] mb-1 truncate">{item.name}</h4>
            </Link>
            <span className="font-mono text-[13px] text-sage">{formatPrice(item.price)}</span>
        </article>
    );
}

export default function WishlistPage() {
    const { items } = useWishlist();

    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            {/* breadcrumb */}
            <div className="font-mono text-[11px] tracking-[0.06em] text-sage pt-[26px] px-[5vw]">
                <Link href="/" className="hover:text-wine transition-colors">Home</Link>
                <span className="mx-2 opacity-50">/</span>
                <span>Wishlist</span>
            </div>

            {/* page head */}
            <div className="pt-[18px] px-[5vw]">
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine">
                    {items.length} saved
                </span>
                <h1 className="font-display font-medium text-[clamp(32px,3.6vw,46px)] leading-[1.05] tracking-[-0.01em] mt-2.5">
                    Your <em className="italic font-normal text-wine">Wishlist</em>
                </h1>
            </div>

            {/* content */}
            <div className="px-[5vw] pb-[100px] pt-9">
                {items.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="font-mono text-[12px] text-sage tracking-[0.04em] mb-6">
                            No items saved yet.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-3 bg-ink text-bone px-8 py-[17px] text-[13px] tracking-[0.04em] font-medium border-none cursor-pointer transition-colors hover:bg-wine"
                        >
                            Browse shop <span>→</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                        {items.map((item) => (
                            <WishlistCard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
