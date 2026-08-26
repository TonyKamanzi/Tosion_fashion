"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "./CartContext";
import StepsBar from "./StepsBar";

function formatPrice(value: number) {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type ShippingForm = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postal: string;
    country: string;
};

const EMPTYShipping: ShippingForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postal: "",
    country: "",
};

type PaymentForm = {
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardName: string;
};

const EMPTY_PAYMENT: PaymentForm = {
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
};

const COUNTRIES = [
    "Kenya", "Rwanda", "Nigeria", "South Africa", "Tanzania", "Uganda",
    "United Kingdom", "United States", "France", "Germany", "Portugal", "Other",
];

function Input({
    label,
    value,
    onChange,
    placeholder,
    required,
    type = "text",
    className = "",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
    type?: string;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-sage mb-2">
                {label} {required && <span className="text-wine">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full border border-ink/14 bg-none py-3 px-3.5 font-sans text-[13.5px] text-ink placeholder:text-sage/60 outline-none focus:border-wine transition-colors"
            />
        </div>
    );
}

function SummaryPanel({ items, totalItems, subtotal, shipping, tax, total }: {
    items: CartItem[];
    totalItems: number;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
}) {
    return (
        <div className="bg-white border border-ink/14 p-8 sticky top-[100px] max-[900px]:static">
            <h3 className="font-display font-medium text-[20px] mb-6">Order Summary</h3>

            {/* items mini-list */}
            <div className="flex flex-col gap-4 mb-6">
                {items.map((item) => (
                    <div key={`${item._id}-${item.selectedColor?.hex}-${item.selectedSize}`} className="flex gap-3">
                        <div className="w-14 h-[72px] shrink-0 bg-bone-2 overflow-hidden relative">
                            <Image
                                src={item.imageUrl || "https://picsum.photos/100/130"}
                                alt={item.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-sans text-[13px] font-medium truncate">{item.name}</p>
                            <p className="font-mono text-[11px] text-sage">
                                {item.selectedColor && <span>{item.selectedColor.name}</span>}
                                {item.selectedColor && item.selectedSize && <span> · </span>}
                                {item.selectedSize && <span>{item.selectedSize}</span>}
                            </p>
                            <p className="font-mono text-[12px] mt-0.5">×{item.qty}</p>
                        </div>
                        <span className="font-mono text-[13px] shrink-0">{formatPrice(item.price * item.qty)}</span>
                    </div>
                ))}
            </div>

            <div className="h-px bg-ink/14 mb-4" />

            <div className="flex justify-between text-[14px] mb-3">
                <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[14px] text-sage mb-3">
                <span>Shipping</span>
                <span className="font-mono">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-[14px] text-sage mb-3">
                <span>Estimated tax</span>
                <span className="font-mono">{formatPrice(tax)}</span>
            </div>

            <div className="h-px bg-ink/14 my-4" />

            <div className="flex justify-between items-baseline mb-6">
                <span className="font-display text-[19px]">Total</span>
                <span className="font-mono text-[22px]">{formatPrice(total)}</span>
            </div>

            <div className="flex gap-2.5 justify-center mb-5 opacity-60">
                <span className="font-mono text-[10px] border border-ink/14 px-2 py-1 tracking-[0.03em]">VISA</span>
                <span className="font-mono text-[10px] border border-ink/14 px-2 py-1 tracking-[0.03em]">MASTERCARD</span>
                <span className="font-mono text-[10px] border border-ink/14 px-2 py-1 tracking-[0.03em]">AMEX</span>
                <span className="font-mono text-[10px] border border-ink/14 px-2 py-1 tracking-[0.03em]">PAYPAL</span>
            </div>

            <div className="flex flex-col gap-3 pt-5 border-t border-ink/14">
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
            </div>
        </div>
    );
}

function Confirmation({ orderNumber, items, total }: { orderNumber: string; items: CartItem[]; total: number }) {
    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            <div className="max-w-[640px] mx-auto px-[5vw] pt-20 pb-[100px] text-center">
                <div className="w-16 h-16 rounded-full bg-good/10 flex items-center justify-center mx-auto mb-6">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-good">
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                </div>
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine block mb-3">
                    Order confirmed
                </span>
                <h1 className="font-display font-medium text-[clamp(28px,3.2vw,40px)] leading-[1.05] tracking-[-0.01em] mb-4">
                    Thank you for your <em className="italic font-normal text-wine">order</em>
                </h1>
                <p className="text-sage text-[14.5px] leading-[1.7] mb-3">
                    Your order <span className="font-mono text-ink">{orderNumber}</span> has been placed successfully.
                    You&apos;ll receive a confirmation email shortly.
                </p>
                <p className="font-mono text-[22px] text-ink mb-10">{formatPrice(total)}</p>

                {/* items recap */}
                <div className="text-left border-t border-ink/14 pt-6 mb-10">
                    <h3 className="font-display font-medium text-[18px] mb-4">Order details</h3>
                    <div className="flex flex-col gap-4">
                        {items.map((item) => (
                            <div key={`${item._id}-${item.selectedColor?.hex}-${item.selectedSize}`} className="flex gap-3 pb-4 border-b border-ink/10 last:border-b-0">
                                <div className="w-14 h-[72px] shrink-0 bg-bone-2 overflow-hidden relative">
                                    <Image
                                        src={item.imageUrl || "https://picsum.photos/100/130"}
                                        alt={item.name}
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-sans text-[13px] font-medium truncate">{item.name}</p>
                                    <p className="font-mono text-[11px] text-sage">
                                        {item.selectedColor && <span>{item.selectedColor.name}</span>}
                                        {item.selectedColor && item.selectedSize && <span> · </span>}
                                        {item.selectedSize && <span>{item.selectedSize}</span>}
                                        {item.qty > 1 && <span> × {item.qty}</span>}
                                    </p>
                                </div>
                                <span className="font-mono text-[13px] shrink-0">{formatPrice(item.price * item.qty)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Link
                    href="/shop"
                    className="inline-flex items-center justify-center gap-3 bg-ink text-bone px-8 py-[17px] text-[13px] tracking-[0.04em] font-medium border-none cursor-pointer transition-colors hover:bg-wine"
                >
                    Continue shopping <span>→</span>
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    const { items, clearCart } = useCart();
    const [step, setStep] = useState<2 | 3>(2);
    const [shipping, setShipping] = useState<ShippingForm>(EMPTYShipping);
    const [payment, setPayment] = useState<PaymentForm>(EMPTY_PAYMENT);
    const [confirmed, setConfirmed] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");

    const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingCost = subtotal >= 150 ? 0 : 12;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + shippingCost + tax;

    if (confirmed) {
        return <Confirmation orderNumber={orderNumber} items={items} total={total} />;
    }

    if (items.length === 0) {
        return (
            <div className="mt-20 bg-bone min-h-[calc(100vh-80px)] flex items-center justify-center">
                <div className="text-center px-[5vw]">
                    <p className="font-mono text-[12px] text-sage tracking-[0.04em] mb-6">Your bag is empty.</p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center justify-center gap-3 bg-ink text-bone px-8 py-[17px] text-[13px] tracking-[0.04em] font-medium border-none cursor-pointer transition-colors hover:bg-wine"
                    >
                        Browse shop <span>→</span>
                    </Link>
                </div>
            </div>
        );
    }

    const updateShipping = (field: keyof ShippingForm, value: string) =>
        setShipping((prev) => ({ ...prev, [field]: value }));

    const updatePayment = (field: keyof PaymentForm, value: string) =>
        setPayment((prev) => ({ ...prev, [field]: value }));

    const handlePlaceOrder = () => {
        setOrderNumber(`TS-${Date.now().toString(36).toUpperCase()}`);
        clearCart();
        setConfirmed(true);
    };

    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            {/* breadcrumb */}
            <div className="font-mono text-[11px] tracking-[0.06em] text-sage pt-[26px] px-[5vw]">
                <Link href="/" className="hover:text-wine transition-colors">Home</Link>
                <span className="mx-2 opacity-50">/</span>
                <Link href="/bag" className="hover:text-wine transition-colors">Bag</Link>
                <span className="mx-2 opacity-50">/</span>
                <span>{step === 2 ? "Shipping" : "Payment"}</span>
            </div>

            {/* page head */}
            <div className="pt-[18px] px-[5vw]">
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine">
                    Step {step} of 3
                </span>
                <h1 className="font-display font-medium text-[clamp(32px,3.6vw,46px)] leading-[1.05] tracking-[-0.01em] mt-2.5">
                    {step === 2 ? (
                        <>Shipping <em className="italic font-normal text-wine">details</em></>
                    ) : (
                        <>Payment <em className="italic font-normal text-wine">method</em></>
                    )}
                </h1>
            </div>

            {/* steps */}
            <StepsBar currentStep={step} />

            {/* 2-col layout */}
            <div className="grid grid-cols-[1.6fr_1fr] gap-14 pt-9 pb-[100px] px-[5vw] items-start max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[900px]:px-6 max-[900px]:pb-[70px]">

                {/* LEFT — form */}
                <div>
                    {step === 2 ? (
                        /* ====== SHIPPING FORM ====== */
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setStep(3);
                            }}
                            className="flex flex-col gap-5"
                        >
                            <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                                <Input
                                    label="First name"
                                    value={shipping.firstName}
                                    onChange={(v) => updateShipping("firstName", v)}
                                    required
                                />
                                <Input
                                    label="Last name"
                                    value={shipping.lastName}
                                    onChange={(v) => updateShipping("lastName", v)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={shipping.email}
                                    onChange={(v) => updateShipping("email", v)}
                                    required
                                />
                                <Input
                                    label="Phone"
                                    type="tel"
                                    value={shipping.phone}
                                    onChange={(v) => updateShipping("phone", v)}
                                    required
                                />
                            </div>
                            <Input
                                label="Address line 1"
                                value={shipping.address1}
                                onChange={(v) => updateShipping("address1", v)}
                                required
                            />
                            <Input
                                label="Address line 2"
                                value={shipping.address2}
                                onChange={(v) => updateShipping("address2", v)}
                                placeholder="Apartment, suite, etc. (optional)"
                            />
                            <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                                <Input
                                    label="City"
                                    value={shipping.city}
                                    onChange={(v) => updateShipping("city", v)}
                                    required
                                />
                                <Input
                                    label="State / Province"
                                    value={shipping.state}
                                    onChange={(v) => updateShipping("state", v)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                                <Input
                                    label="Postal code"
                                    value={shipping.postal}
                                    onChange={(v) => updateShipping("postal", v)}
                                    required
                                />
                                <div>
                                    <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-sage mb-2">
                                        Country <span className="text-wine">*</span>
                                    </label>
                                    <select
                                        value={shipping.country}
                                        onChange={(e) => updateShipping("country", e.target.value)}
                                        required
                                        className="w-full border border-ink/14 bg-bone py-3 px-3.5 font-sans text-[13.5px] text-ink outline-none focus:border-wine transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="">Select country</option>
                                        {COUNTRIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <Link
                                    href="/bag"
                                    className="font-mono text-[11.5px] tracking-[0.05em] text-wine hover:underline self-center"
                                >
                                    ← Back to bag
                                </Link>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-3 bg-ink text-bone px-6.5 py-[17px] text-[13px] tracking-[0.04em] font-medium border-none cursor-pointer transition-colors hover:bg-wine"
                                >
                                    Continue to payment <span>→</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* ====== PAYMENT FORM ====== */
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handlePlaceOrder();
                            }}
                            className="flex flex-col gap-5"
                        >
                            <Input
                                label="Cardholder name"
                                value={payment.cardName}
                                onChange={(v) => updatePayment("cardName", v)}
                                required
                            />
                            <Input
                                label="Card number"
                                value={payment.cardNumber}
                                onChange={(v) => updatePayment("cardNumber", v)}
                                placeholder="1234 5678 9012 3456"
                                required
                            />
                            <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
                                <Input
                                    label="Expiry date"
                                    value={payment.expiry}
                                    onChange={(v) => updatePayment("expiry", v)}
                                    placeholder="MM / YY"
                                    required
                                />
                                <Input
                                    label="CVV"
                                    value={payment.cvv}
                                    onChange={(v) => updatePayment("cvv", v)}
                                    placeholder="123"
                                    required
                                />
                            </div>

                            {/* shipping recap */}
                            <div className="mt-4 p-5 border border-ink/14">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-sage">Shipping to</span>
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="font-mono text-[11px] text-wine underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-ink"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <p className="text-[14px]">
                                    {shipping.firstName} {shipping.lastName}
                                </p>
                                <p className="text-[13px] text-sage">{shipping.address1}</p>
                                {shipping.address2 && <p className="text-[13px] text-sage">{shipping.address2}</p>}
                                <p className="text-[13px] text-sage">
                                    {shipping.city}{shipping.state && `, ${shipping.state}`} {shipping.postal}
                                </p>
                                <p className="text-[13px] text-sage">{shipping.country}</p>
                                <p className="text-[13px] text-sage mt-2">{shipping.email} · {shipping.phone}</p>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="font-mono text-[11.5px] tracking-[0.05em] text-wine hover:underline self-center cursor-pointer bg-none border-none"
                                >
                                    ← Back to shipping
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-3 bg-ink text-bone px-6.5 py-[17px] text-[13px] tracking-[0.04em] font-medium border-none cursor-pointer transition-colors hover:bg-wine"
                                >
                                    Place order — {formatPrice(total)} <span>→</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* RIGHT — summary */}
                <SummaryPanel
                    items={items}
                    totalItems={totalItems}
                    subtotal={subtotal}
                    shipping={shippingCost}
                    tax={tax}
                    total={total}
                />
            </div>
        </div>
    );
}
