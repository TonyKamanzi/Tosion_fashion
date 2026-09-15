"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { API_URL } from "@/lib/api";

export type ProductDoc = {
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

type ReviewDoc = {
    _id: string;
    name: string;
    rating: number;
    title: string;
    body: string;
    createdAt: string;
};

type ReviewsResponse = {
    items: ReviewDoc[];
    averageRating: number;
    reviewCount: number;
};

function formatPrice(value: number) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function savePercent(price: number, compareAt: number) {
    return Math.round(((compareAt - price) / compareAt) * 100);
}

type Props = { product: ProductDoc };

export default function ProductDetail({ product }: Props) {
    const images = [product.imageUrl, product.imageAltUrl].filter(Boolean);
    const [activeIdx, setActiveIdx] = useState(0);
    const [selectedColor, setSelectedColor] = useState(
        product.colors.length > 0 ? product.colors[0].hex : "",
    );
    const [selectedSize, setSelectedSize] = useState("");
    const [qty, setQty] = useState(1);
    const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
        details: true,
    });
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const saved = isInWishlist(product._id);

    // reviews state
    const [reviews, setReviews] = useState<ReviewDoc[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, title: "", body: "" });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");

    const fetchReviews = useCallback(async () => {
        try {
            const { data } = await axios.get<ReviewsResponse>(
                `${API_URL}/reviews/product/${product._id}`
            );
            setReviews(data.items);
            setAverageRating(data.averageRating);
            setReviewCount(data.reviewCount);
        } catch { /* ignore */ }
    }, [product._id]);

    // fetch reviews on mount (async IIFE satisfies react-hooks/set-state-in-effect)
    useEffect(() => {
        void (async () => { await fetchReviews(); })();
    }, [fetchReviews]);

    const toggleAccordion = (key: string) =>
        setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));

    const colorLabel =
        product.colors.find((c) => c.hex === selectedColor)?.name || selectedColor;

    const hasDiscount =
        product.compareAtPrice !== null && product.compareAtPrice > product.price;

    // split name so last word becomes italic wine em
    const words = product.name.split(" ");
    const lastWord = words.pop() ?? "";
    const head = words.length > 0 ? `${words.join(" ")} ` : "";

    return (
        <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_0.85fr] gap-[60px] px-[5vw] pt-6 pb-[90px]">
            {/* ========== GALLERY ========== */}
            <div className="grid grid-cols-[88px_1fr] gap-4 h-fit">
                {/* thumbnails */}
                {images.length > 1 && (
                    <div className="flex flex-col gap-3">
                        {images.map((src, i) => (
                            <button
                                key={src}
                                type="button"
                                onClick={() => setActiveIdx(i)}
                                className={`aspect-3/4 overflow-hidden cursor-pointer border transition-all duration-200 ${
                                    i === activeIdx
                                        ? "border-ink opacity-100"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                            >
                                <Image
                                    src={src}
                                    alt={`${product.name} view ${i + 1}`}
                                    width={140}
                                    height={180}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* main image */}
                <div className="relative aspect-3/4 overflow-hidden bg-bone-2">
                    {images.length > 0 ? (
                        <Image
                            src={images[activeIdx]}
                            alt={product.imageAlt || product.name}
                            fill
                            sizes="(min-width: 900px) 45vw, 90vw"
                            className="object-cover transition-opacity duration-300"
                            key={activeIdx}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-sage font-mono text-[11px] tracking-[0.08em] uppercase">
                            No image
                        </div>
                    )}

                    {product.tag && (
                        <span className="absolute z-10 top-4 right-0 bg-wine text-bone font-mono text-[11px] tracking-[0.05em] px-2.5 py-1.5 before:absolute before:content-[''] before:top-0 before:-left-2.25 before:border-solid before:border-[14.5px_9px_14.5px_0] before:border-transparent before:border-r-wine">
                            {product.tag}
                        </span>
                    )}

                    <div className="absolute bottom-4 right-4 z-10 bg-bone/90 w-9 h-9 rounded-full flex items-center justify-center text-ink">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4.3-4.3" />
                            <path d="M11 8v6M8 11h6" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* ========== INFO PANEL ========== */}
            <div className="pt-1.5">
                {/* eyebrow + sku */}
                <div className="flex justify-between items-center mb-3.5">
                    <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine">
                        {product.category?.label || "Collection"}
                    </span>
                    <span className="font-mono text-[11px] text-sage">
                        SKU {product.slug.toUpperCase()}
                    </span>
                </div>

                {/* name */}
                <h1 className="font-display font-medium text-[clamp(30px,3.2vw,42px)] leading-[1.05] tracking-[-0.01em] mb-3.5">
                    {head}
                    <em className="italic font-normal text-wine">{lastWord}</em>
                </h1>

                {/* star rating */}
                <div className="flex items-center gap-2 mb-5.5">
                    <span className="text-gold text-sm tracking-[2px]">
                        {"★".repeat(Math.round(averageRating))}{"☆".repeat(5 - Math.round(averageRating))}
                    </span>
                    <span className="text-[12.5px] text-sage font-mono">
                        {averageRating > 0 ? averageRating : "—"} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                    </span>
                </div>

                {/* price */}
                <div className="flex items-baseline gap-3 mb-7">
                    <span className="font-mono text-[22px]">{formatPrice(product.price)}</span>
                    {hasDiscount && (
                        <>
                            <span className="font-mono text-[15px] text-sage line-through">
                                {formatPrice(product.compareAtPrice!)}
                            </span>
                            <span className="font-mono text-[11px] text-wine bg-wine/8 px-2 py-1">
                                Save {savePercent(product.price, product.compareAtPrice!)}%
                            </span>
                        </>
                    )}
                </div>

                {/* description */}
                {product.description && (
                    <p className="text-sage text-[14.5px] leading-[1.75] mb-8 max-w-[48ch]">
                        {product.description}
                    </p>
                )}

                {/* colour swatches */}
                {product.colors.length > 0 && (
                    <div className="mb-7">
                        <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-sage block mb-3.5">
                            Colour: <span className="text-ink">{colorLabel}</span>
                        </span>
                        <div className="flex gap-2.5">
                            {product.colors.map((c, i) => (
                                <button
                                    key={`${c.hex}-${i}`}
                                    type="button"
                                    title={c.name || c.hex}
                                    onClick={() => setSelectedColor(c.hex)}
                                    className={`w-[34px] h-[34px] rounded-full cursor-pointer border transition-all ${
                                        selectedColor === c.hex
                                            ? "border-ink outline outline-1 outline-offset-[-4px]"
                                            : "border-ink/15"
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* sizes */}
                {product.sizes.length > 0 && (
                    <div className="mb-7">
                        <div className="flex justify-between items-center mb-3.5">
                            <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-sage">
                                Size: <span className="text-ink">{selectedSize || "Select"}</span>
                            </span>
                            <span className="font-mono text-[11px] text-wine underline underline-offset-[3px] cursor-pointer">
                                Size guide
                            </span>
                        </div>
                        <div className="flex gap-2.5 flex-wrap">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-[52px] h-[44px] flex items-center justify-center border font-mono text-[13px] cursor-pointer transition-all ${
                                        selectedSize === size
                                            ? "bg-ink text-bone border-ink"
                                            : "border-ink/15 hover:border-ink"
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* quantity + stock */}
                <div className="flex items-center gap-5 mb-5">
                    <div className="flex items-center border border-ink">
                        <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            className="w-[38px] h-[44px] bg-none border-none cursor-pointer text-[16px] text-ink"
                        >
                            −
                        </button>
                        <span className="w-9 text-center font-mono text-[14px]">{qty}</span>
                        <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setQty((q) => q + 1)}
                            className="w-[38px] h-[44px] bg-none border-none cursor-pointer text-[16px] text-ink"
                        >
                            +
                        </button>
                    </div>
                    <span className="font-mono text-[11.5px] text-good flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-good" />
                        In stock
                    </span>
                </div>

                {/* action buttons */}
                <div className="flex gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            addItem({
                                _id: product._id,
                                name: product.name,
                                slug: product.slug,
                                price: product.price,
                                imageUrl: product.imageUrl,
                                imageAltUrl: product.imageAltUrl,
                                category: product.category,
                                selectedColor: product.colors.find((c) => c.hex === selectedColor) || null,
                                selectedSize,
                                qty,
                            });
                        }}
                        className="flex-1 flex items-center justify-center gap-3 bg-ink text-bone px-6.5 py-[17px] text-[13px] tracking-[0.04em] font-medium border-none cursor-pointer transition-colors hover:bg-wine"
                    >
                        Add to bag — {formatPrice(product.price)}
                        <span>→</span>
                    </button>
                    <button
                        type="button"
                        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                        onClick={() => toggleWishlist({
                            _id: product._id,
                            name: product.name,
                            slug: product.slug,
                            price: product.price,
                            imageUrl: product.imageUrl,
                            imageAltUrl: product.imageAltUrl,
                            category: product.category,
                        })}
                        className={`w-[54px] shrink-0 border cursor-pointer flex items-center justify-center transition-all ${
                            saved
                                ? "border-wine bg-wine text-bone"
                                : "border-ink bg-none text-ink hover:bg-ink hover:text-bone"
                        }`}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                        </svg>
                    </button>
                </div>

                {/* trust strip */}
                <div className="flex flex-col gap-3.5 py-6 border-y border-ink/15 mb-7">
                    <div className="flex items-center gap-3 text-[13px] text-sage">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-wine">
                            <rect x="1" y="3" width="15" height="13" />
                            <path d="M16 8h4l3 3v5h-7V8z" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                        Free shipping on orders over $150
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-sage">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-wine">
                            <path d="M21 12a9 9 0 1 1-3-6.7" />
                            <path d="M21 3v6h-6" />
                        </svg>
                        30-day returns, no questions asked
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-sage">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-wine">
                            <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
                        </svg>
                        Made in small batches — 2 year guarantee
                    </div>
                </div>

                {/* accordion */}
                <div className="border-t border-ink/15">
                    {/* Details & care */}
                    <div className="border-b border-ink/15">
                        <button
                            type="button"
                            onClick={() => toggleAccordion("details")}
                            className="w-full flex justify-between items-center py-[18px] px-0.5 cursor-pointer text-[14px] font-medium bg-none border-none text-ink"
                        >
                            Details &amp; care
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`text-sage transition-transform duration-200 ${openAccordions.details ? "rotate-180" : ""}`}
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        <div
                            className={`overflow-hidden transition-[max-height] duration-300 ${openAccordions.details ? "max-h-[260px]" : "max-h-0"}`}
                        >
                            <ul className="px-0.5 pb-5 text-sage text-[13.5px] leading-[1.7] list-disc pl-[18px]">
                                {product.sizes.length > 0 && (
                                    <li>Available sizes: {product.sizes.join(", ")}</li>
                                )}
                                {product.colors.length > 0 && (
                                    <li>
                                        Colours:{" "}
                                        {product.colors.map((c) => c.name || c.hex).join(", ")}
                                    </li>
                                )}
                                {product.department && (
                                    <li>Line: {product.department === "women" ? "Women" : "Men"}</li>
                                )}
                                {product.description && <li>{product.description}</li>}
                            </ul>
                        </div>
                    </div>

                    {/* Shipping & returns */}
                    <div className="border-b border-ink/15">
                        <button
                            type="button"
                            onClick={() => toggleAccordion("shipping")}
                            className="w-full flex justify-between items-center py-[18px] px-0.5 cursor-pointer text-[14px] font-medium bg-none border-none text-ink"
                        >
                            Shipping &amp; returns
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`text-sage transition-transform duration-200 ${openAccordions.shipping ? "rotate-180" : ""}`}
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        <div
                            className={`overflow-hidden transition-[max-height] duration-300 ${openAccordions.shipping ? "max-h-[260px]" : "max-h-0"}`}
                        >
                            <p className="px-0.5 pb-5 text-sage text-[13.5px] leading-[1.7]">
                                Orders ship within 48 hours. Free standard shipping over $150,
                                express available at checkout. Returns accepted within 30 days in
                                original condition.
                            </p>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="border-b border-ink/15">
                        <button
                            type="button"
                            onClick={() => toggleAccordion("reviews")}
                            className="w-full flex justify-between items-center py-[18px] px-0.5 cursor-pointer text-[14px] font-medium bg-none border-none text-ink"
                        >
                            Reviews ({reviewCount})
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`text-sage transition-transform duration-200 ${openAccordions.reviews ? "rotate-180" : ""}`}
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        <div
                            className={`overflow-hidden transition-[max-height] duration-300 ${openAccordions.reviews ? "max-h-[800px]" : "max-h-0"}`}
                        >
                            <div className="px-0.5 pb-5">
                                {/* review list */}
                                {reviews.length === 0 ? (
                                    <p className="text-sage text-[13.5px] leading-[1.7] mb-5">
                                        No reviews yet. Be the first to review this product.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-5 mb-6">
                                        {reviews.map((r) => (
                                            <div key={r._id} className="border-b border-ink/10 pb-4 last:border-b-0 last:pb-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-gold text-[13px] tracking-[1px]">
                                                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                                                    </span>
                                                    <span className="font-mono text-[11px] text-sage">
                                                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>
                                                </div>
                                                {r.title && (
                                                    <p className="font-medium text-[13.5px] mb-1">{r.title}</p>
                                                )}
                                                <p className="text-sage text-[13px] leading-[1.7] mb-1.5">{r.body}</p>
                                                <span className="font-mono text-[11px] text-sage">— {r.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* write a review form */}
                                <div className="border-t border-ink/10 pt-5">
                                    <p className="font-medium text-[13.5px] mb-3">Write a review</p>
                                    {reviewMessage && (
                                        <p className={`font-mono text-[11px] mb-3 ${reviewMessage.startsWith("Thanks") ? "text-good" : "text-wine"}`}>
                                            {reviewMessage}
                                        </p>
                                    )}
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            setReviewSubmitting(true);
                                            setReviewMessage("");
                                            try {
                                                await axios.post(`${API_URL}/reviews`, {
                                                    product: product._id,
                                                    name: reviewForm.name,
                                                    rating: reviewForm.rating,
                                                    title: reviewForm.title,
                                                    body: reviewForm.body,
                                                });
                                                setReviewForm({ name: "", rating: 5, title: "", body: "" });
                                                setReviewMessage("Thanks for your review!");
                                                fetchReviews();
                                            } catch {
                                                setReviewMessage("Failed to submit review. Please try again.");
                                            } finally {
                                                setReviewSubmitting(false);
                                            }
                                        }}
                                        className="flex flex-col gap-3"
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Your name"
                                                value={reviewForm.name}
                                                onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                                                required
                                                className="border border-ink/14 bg-none py-2.5 px-3 font-sans text-[13px] text-ink placeholder:text-sage/60 outline-none focus:border-wine transition-colors"
                                            />
                                            <select
                                                value={reviewForm.rating}
                                                onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                                                className="border border-ink/14 bg-bone py-2.5 px-3 font-sans text-[13px] text-ink outline-none cursor-pointer focus:border-wine transition-colors"
                                            >
                                                <option value={5}>5 ★★★★★</option>
                                                <option value={4}>4 ★★★★☆</option>
                                                <option value={3}>3 ★★★☆☆</option>
                                                <option value={2}>2 ★★☆☆☆</option>
                                                <option value={1}>1 ★☆☆☆☆</option>
                                            </select>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Review title (optional)"
                                            value={reviewForm.title}
                                            onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                                            className="border border-ink/14 bg-none py-2.5 px-3 font-sans text-[13px] text-ink placeholder:text-sage/60 outline-none focus:border-wine transition-colors"
                                        />
                                        <textarea
                                            placeholder="Write your review..."
                                            value={reviewForm.body}
                                            onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                                            required
                                            rows={3}
                                            className="border border-ink/14 bg-none py-2.5 px-3 font-sans text-[13px] text-ink placeholder:text-sage/60 outline-none focus:border-wine transition-colors resize-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={reviewSubmitting}
                                            className="self-start bg-ink text-bone px-5 py-2.5 font-mono text-[11px] tracking-[0.06em] uppercase border-none cursor-pointer transition-colors hover:bg-wine disabled:opacity-50"
                                        >
                                            {reviewSubmitting ? "Submitting..." : "Submit review"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
