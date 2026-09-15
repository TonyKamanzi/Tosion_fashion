"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { useCart, type CartItem } from "./CartContext";
import { calcTotals } from "./calcTotals";
import StepsBar from "./StepsBar";
import { API_URL } from "@/lib/api";

function formatPrice(value: number) {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ItemRow({ item }: { item: CartItem }) {
    const { removeItem, updateQty, saveForLater } = useCart();
    return (
        <div className="grid grid-cols-[110px_1fr_auto] gap-6 py-7 border-b border-ink/14 first:pt-0">
            {/* image */}
            <Link href={`/product/${item.slug}`} className="aspect-3/4 overflow-hidden bg-bone-2 block relative">
                <Image
                    src={item.imageUrl || "https://picsum.photos/300/400"}
                    alt={item.name}
                    fill
                    sizes="110px"
                    className="object-cover"
                />
            </Link>

            {/* info */}
            <div className="flex flex-col">
                <Link href={`/product/${item.slug}`} className="font-display font-medium text-[16px] mb-1.5">
                    {item.name}
                </Link>
                <span className="text-[12.5px] text-sage mb-3 block">
                    {item.category?.label || "Collection"}
                </span>
                <div className="flex gap-4 font-mono text-[11.5px] text-sage mb-4">
                    {item.selectedColor && (
                        <span>Colour: <b className="text-ink font-normal">{item.selectedColor.name}</b></span>
                    )}
                    {item.selectedSize && (
                        <span>Size: <b className="text-ink font-normal">{item.selectedSize}</b></span>
                    )}
                </div>
                <div className="flex items-center gap-5 mt-auto">
                    <div className="flex items-center border border-ink">
                        <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(item._id, item.qty - 1)}
                            className="w-8 h-9 bg-none border-none cursor-pointer text-[15px] text-ink"
                        >
                            −
                        </button>
                        <span className="w-[30px] text-center font-mono text-[13px]">{item.qty}</span>
                        <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(item._id, item.qty + 1)}
                            className="w-8 h-9 bg-none border-none cursor-pointer text-[15px] text-ink"
                        >
                            +
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => removeItem(item._id)}
                        className="font-mono text-[11px] tracking-[0.04em] text-sage underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-wine"
                    >
                        Remove
                    </button>
                    <button
                        type="button"
                        onClick={() => saveForLater(item._id)}
                        className="font-mono text-[11px] tracking-[0.04em] text-sage underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-wine"
                    >
                        Save for later
                    </button>
                </div>
            </div>

            {/* price */}
            <div className="text-right flex flex-col items-end">
                <span className="font-mono text-[16px] block mb-1.5">{formatPrice(item.price * item.qty)}</span>
                {item.qty > 1 && (
                    <span className="font-mono text-[11px] text-sage">{formatPrice(item.price)} each</span>
                )}
                <div className="flex items-center gap-1.5 mt-2.5 font-mono text-[11px] text-good">
                    <span className="w-[5px] h-[5px] rounded-full bg-good" />
                    In stock
                </div>
            </div>
        </div>
    );
}

function SavedCard({ item }: { item: CartItem }) {
    const { moveToBag } = useCart();
    return (
        <div className="group">
            <div className="aspect-3/4 overflow-hidden bg-bone-2 relative mb-2.5">
                <Image
                    src={item.imageUrl || "https://picsum.photos/400/500"}
                    alt={item.name}
                    fill
                    sizes="(min-width: 900px) 20vw, 45vw"
                    className="object-cover transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-106"
                />
                <button
                    type="button"
                    onClick={() => moveToBag(item._id)}
                    className="absolute left-2 right-2 bottom-2 bg-bone text-center py-2.5 font-mono text-[10px] tracking-[0.06em] uppercase opacity-0 translate-y-1.5 transition-all duration-250 group-hover:opacity-100 group-hover:translate-y-0 cursor-pointer"
                >
                    Move to bag
                </button>
            </div>
            <h4 className="font-sans font-medium text-[13px] mb-0.5">{item.name}</h4>
            <span className="font-mono text-[12px] text-sage">{formatPrice(item.price)}</span>
        </div>
    );
}

export default function BagPage() {
    const { items, saved, promo, applyPromo, removePromo } = useCart();
    const { totalItems, subtotal, shipping, tax, discount, total } = calcTotals(items, promo);

    const [promoCode, setPromoCode] = useState("");
    const [promoError, setPromoError] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError("");
        try {
            const { data } = await axios.post(`${API_URL}/promos/validate`, {
                code: promoCode.trim(),
                subtotal,
            });
            if (data.valid) {
                applyPromo({ code: data.code, type: data.type, value: data.value, discountAmount: data.discountAmount });
                setPromoCode("");
                toast.success("Promo applied", { description: `${data.code} — ${data.type === "percent" ? `${data.value}% off` : `$${data.value} off`}` });
            } else {
                setPromoError(data.message || "Invalid code");
            }
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) ? err.response?.data?.message : "Failed to validate";
            setPromoError(msg || "Failed to validate");
        } finally {
            setPromoLoading(false);
        }
    };

    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            {/* breadcrumb */}
            <div className="font-mono text-[11px] tracking-[0.06em] text-sage pt-[26px] px-[5vw]">
                <Link href="/" className="hover:text-wine transition-colors">Home</Link>
                <span className="mx-2 opacity-50">/</span>
                <span>Your Bag</span>
            </div>

            {/* page head */}
            <div className="pt-[18px] px-[5vw]">
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                </span>
                <h1 className="font-display font-medium text-[clamp(32px,3.6vw,46px)] leading-[1.05] tracking-[-0.01em] mt-2.5">
                    Your <em className="italic font-normal text-wine">Bag</em>
                </h1>
            </div>

            {/* steps */}
            <StepsBar currentStep={1} />

            {/* 2-col layout */}
            <div className="grid grid-cols-[1.6fr_1fr] gap-14 pt-9 pb-[100px] px-[5vw] items-start max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[900px]:px-6 max-[900px]:pb-[70px]">

                {/* LEFT — items + saved */}
                <div>
                    {/* items */}
                    <div className="border-t border-ink/14">
                        {items.length === 0 && (
                            <div className="py-16 text-center font-mono text-[12px] text-sage tracking-[0.04em]">
                                Your bag is empty.
                            </div>
                        )}
                        {items.map((item) => (
                            <ItemRow key={`${item._id}-${item.selectedColor?.hex}-${item.selectedSize}`} item={item} />
                        ))}
                    </div>

                    {/* continue shopping */}
                    {items.length > 0 && (
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2.5 mt-7 font-mono text-[11.5px] tracking-[0.05em] text-wine hover:underline"
                        >
                            ← Continue shopping
                        </Link>
                    )}

                    {/* saved for later */}
                    {saved.length > 0 && (
                        <div className="mt-[50px]">
                            <h3 className="font-display font-medium text-[20px] mb-5">
                                Saved for <em className="italic font-normal text-wine">later</em>
                            </h3>
                            <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-2">
                                {saved.map((item) => (
                                    <SavedCard key={`saved-${item._id}-${item.selectedColor?.hex}-${item.selectedSize}`} item={item} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT — summary */}
                <div className="bg-white border border-ink/14 p-8 sticky top-[100px] max-[900px]:static">
                    <h3 className="font-display font-medium text-[20px] mb-6">Order Summary</h3>

                    {/* promo */}
                    {promo ? (
                        <div className="flex items-center justify-between border border-good/30 bg-good/5 px-4 py-3 mb-7">
                            <div>
                                <span className="font-mono text-[11px] tracking-[0.06em] uppercase text-good mr-2">
                                    {promo.code}
                                </span>
                                <span className="text-[12.5px] text-sage">
                                    — {promo.type === "percent" ? `${promo.value}% off` : `${formatPrice(promo.value)} off`}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={removePromo}
                                className="font-mono text-[11px] text-wine underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-ink"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <div className="mb-7">
                            <div className="flex border border-ink">
                                <input
                                    type="text"
                                    placeholder="Promo code"
                                    value={promoCode}
                                    onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                                    className="flex-1 border-none outline-none bg-none py-3.5 px-3.5 font-sans text-[13.5px] text-ink placeholder:text-sage"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyPromo}
                                    disabled={promoLoading}
                                    className="bg-ink text-bone border-none px-4.5 cursor-pointer font-mono text-[11px] tracking-[0.06em] uppercase disabled:opacity-50"
                                >
                                    {promoLoading ? "..." : "Apply"}
                                </button>
                            </div>
                            {promoError && (
                                <p className="font-mono text-[11px] text-wine mt-2">{promoError}</p>
                            )}
                        </div>
                    )}

                    {/* lines */}
                    <div className="flex justify-between text-[14px] mb-3.5">
                        <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                        <span className="font-mono">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[14px] text-sage mb-3.5">
                        <span>Shipping</span>
                        <span className="font-mono">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-[14px] text-sage mb-3.5">
                        <span>Estimated tax</span>
                        <span className="font-mono">{formatPrice(tax)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-[14px] text-good mb-3.5">
                            <span>Discount</span>
                            <span className="font-mono">-{formatPrice(discount)}</span>
                        </div>
                    )}

                    <div className="h-px bg-ink/14 my-[18px]" />

                    {/* total */}
                    <div className="flex justify-between items-baseline mb-7">
                        <span className="font-display text-[19px]">Total</span>
                        <span className="font-mono text-[22px]">{formatPrice(total)}</span>
                    </div>

                    {/* checkout */}
                    <Link
                        href="/checkout"
                        className="flex items-center justify-center gap-3 bg-ink text-bone w-full py-[17px] px-6.5 text-[13px] tracking-[0.04em] font-medium border-none cursor-pointer transition-colors hover:bg-wine mb-4"
                    >
                        Checkout — {formatPrice(total)} <span>→</span>
                    </Link>

                    {/* payment icons */}
                    <div className="flex gap-2.5 justify-center mb-6 opacity-60">
                        <span className="font-mono text-[10px] border border-ink/14 px-2 py-1 tracking-[0.03em]">VISA</span>
                        <span className="font-mono text-[10px] border border-ink/14 px-2 py-1 tracking-[0.03em]">MASTERCARD</span>
                        <span className="font-mono text-[10px] border border-ink/14 px-2 py-1 tracking-[0.03em]">AMEX</span>
                        <span className="font-mono text-[10px] border border-ink/14 px-2 py-1 tracking-[0.03em]">PAYPAL</span>
                    </div>

                    {/* trust strip */}
                    <div className="flex flex-col gap-3 pt-[22px] border-t border-ink/14">
                        <div className="flex items-center gap-2.5 text-[12.5px] text-sage">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-wine">
                                <rect x="3" y="11" width="18" height="10" rx="1" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Secure checkout, encrypted end to end
                        </div>
                        <div className="flex items-center gap-2.5 text-[12.5px] text-sage">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-wine">
                                <path d="M21 12a9 9 0 1 1-3-6.7" />
                                <path d="M21 3v6h-6" />
                            </svg>
                            30-day returns, no questions asked
                        </div>
                        <div className="flex items-center gap-2.5 text-[12.5px] text-sage">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-wine">
                                <rect x="1" y="3" width="15" height="13" />
                                <path d="M16 8h4l3 3v5h-7V8z" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                            Free shipping on this order
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
