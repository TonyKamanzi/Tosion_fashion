"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { useCustomerSession } from "./CustomerSessionContext";

type OrderItem = {
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    selectedColor: { name: string; hex: string } | null;
    selectedSize: string;
    qty: number;
};

type Order = {
    _id: string;
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
    shipping: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postal: string;
        country: string;
    };
};

function formatPrice(value: number) {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-gold/15 text-gold",
    confirmed: "bg-blue-500/15 text-blue-600",
    shipped: "bg-wine/15 text-wine",
    delivered: "bg-good/15 text-good",
    cancelled: "bg-ink/8 text-sage",
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const TIMELINE_STEPS = ["pending", "confirmed", "shipped", "delivered"];

function OrderTimeline({ status }: { status: Order["status"] }) {
    if (status === "cancelled") {
        return (
            <div className="flex items-center gap-2 py-3">
                <span className="w-6 h-6 rounded-full bg-ink/8 text-sage flex items-center justify-center text-[10px]">
                    ✕
                </span>
                <span className="font-mono text-[11px] text-sage uppercase tracking-wider">Order cancelled</span>
            </div>
        );
    }

    const currentIdx = TIMELINE_STEPS.indexOf(status);

    return (
        <div className="py-3">
            <div className="flex items-center gap-0">
                {TIMELINE_STEPS.map((step, i) => {
                    const isComplete = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center">
                                <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono transition-colors ${
                                        isComplete
                                            ? "bg-wine text-bone"
                                            : "bg-bone-2 text-sage"
                                    } ${isCurrent ? "ring-2 ring-wine/30" : ""}`}
                                >
                                    {isComplete ? "✓" : i + 1}
                                </span>
                                <span className={`font-mono text-[9px] mt-1 tracking-wider uppercase ${isComplete ? "text-ink" : "text-sage"}`}>
                                    {STATUS_LABELS[step]}
                                </span>
                            </div>
                            {i < TIMELINE_STEPS.length - 1 && (
                                <div className={`h-px flex-1 mx-1 mb-4 ${i < currentIdx ? "bg-wine" : "bg-ink/15"}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
    return (
        <div className="border border-ink/14 bg-white p-6 mb-3">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="font-mono text-[11px] tracking-[0.06em] uppercase text-sage block mb-1">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    <h3 className="font-display font-medium text-[18px]">
                        Order <span className="font-mono text-wine">{order.orderNumber}</span>
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="font-mono text-[11px] text-sage underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-ink"
                >
                    Close
                </button>
            </div>

            {/* timeline */}
            <OrderTimeline status={order.status} />

            {/* items */}
            <div className="flex flex-col gap-3 mb-5 mt-2">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 pb-3 border-b border-ink/10 last:border-b-0 last:pb-0">
                        <div className="w-12 h-[56px] shrink-0 bg-bone-2 overflow-hidden relative">
                            <Image
                                src={item.imageUrl || "https://picsum.photos/100/130"}
                                alt={item.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-sans text-[13px] font-medium truncate">{item.name}</p>
                            <p className="font-mono text-[11px] text-sage">
                                {item.selectedColor?.name}
                                {item.selectedColor && item.selectedSize && " · "}
                                {item.selectedSize}
                                {item.qty > 1 && ` × ${item.qty}`}
                            </p>
                        </div>
                        <span className="font-mono text-[13px] shrink-0">{formatPrice(item.price * item.qty)}</span>
                    </div>
                ))}
            </div>

            {/* totals */}
            <div className="border-t border-ink/14 pt-4 space-y-1.5">
                <div className="flex justify-between text-[13px] text-sage">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-sage">
                    <span>Shipping</span>
                    <span className="font-mono">{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-sage">
                    <span>Tax</span>
                    <span className="font-mono">{formatPrice(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                    <div className="flex justify-between text-[13px] text-good">
                        <span>Discount</span>
                        <span className="font-mono">-{formatPrice(order.discount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-[14px] font-medium pt-1.5 border-t border-ink/14">
                    <span>Total</span>
                    <span className="font-mono">{formatPrice(order.total)}</span>
                </div>
            </div>

            {/* shipping address */}
            <div className="mt-5 pt-4 border-t border-ink/14">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-sage block mb-2">
                    Shipping to
                </span>
                <p className="text-[13px]">
                    {order.shipping.firstName} {order.shipping.lastName}
                </p>
                <p className="text-[12.5px] text-sage">{order.shipping.address1}</p>
                <p className="text-[12.5px] text-sage">
                    {order.shipping.city}{order.shipping.state && `, ${order.shipping.state}`} {order.shipping.postal}
                </p>
                <p className="text-[12.5px] text-sage">{order.shipping.country}</p>
            </div>
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="bg-white border border-ink/14 p-6 animate-pulse">
            <div className="h-5 bg-bone-2 w-20 mb-5"></div>
            <div className="space-y-4">
                <div>
                    <div className="h-2.5 bg-bone-2 w-10 mb-2"></div>
                    <div className="h-4 bg-bone-2 w-32"></div>
                </div>
                <div>
                    <div className="h-2.5 bg-bone-2 w-10 mb-2"></div>
                    <div className="h-4 bg-bone-2 w-48"></div>
                </div>
            </div>
        </div>
    );
}

function OrdersSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-ink/14 p-5 animate-pulse">
                    <div className="flex justify-between mb-3">
                        <div>
                            <div className="h-3 bg-bone-2 w-20 mb-1.5"></div>
                            <div className="h-4 bg-bone-2 w-24"></div>
                        </div>
                        <div className="text-right">
                            <div className="h-5 bg-bone-2 w-16 rounded-full mb-1.5"></div>
                            <div className="h-4 bg-bone-2 w-16"></div>
                        </div>
                    </div>
                    <div className="h-3 bg-bone-2 w-14"></div>
                </div>
            ))}
        </div>
    );
}

export default function AccountPage() {
    const { user, loading, logout } = useCustomerSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            const { data } = await axios.get<{ items: Order[] }>("http://localhost:2000/orders/mine", { withCredentials: true });
            setOrders(data.items);
        } catch {
            setOrdersError(true);
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            void (async () => { await fetchOrders(); })();
        }
    }, [user, fetchOrders]);

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out", { description: "You've been signed out." });
    };

    if (loading) {
        return (
            <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
                <div className="pt-[26px] px-[5vw]">
                    <div className="h-3 bg-bone-2 w-32 animate-pulse mb-4"></div>
                    <div className="h-10 bg-bone-2 w-64 animate-pulse mb-10"></div>
                </div>
                <div className="px-[5vw] pb-[100px] grid grid-cols-[1fr_2fr] gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-8">
                    <ProfileSkeleton />
                    <div>
                        <div className="h-6 bg-bone-2 w-40 animate-pulse mb-5"></div>
                        <OrdersSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mt-20 bg-bone min-h-[calc(100vh-80px)] flex items-center justify-center">
                <div className="text-center px-[5vw]">
                    <p className="font-mono text-[12px] text-sage tracking-[0.04em] mb-6">
                        Please sign in to view your account.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-3 bg-ink text-bone px-8 py-[17px] text-[13px] tracking-[0.04em] font-medium border-none cursor-pointer transition-colors hover:bg-wine"
                    >
                        Sign in <span>→</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            {/* breadcrumb */}
            <div className="font-mono text-[11px] tracking-[0.06em] text-sage pt-[26px] px-[5vw]">
                <Link href="/" className="hover:text-wine transition-colors">Home</Link>
                <span className="mx-2 opacity-50">/</span>
                <span>My Account</span>
            </div>

            <div className="pt-[18px] px-[5vw]">
                <h1 className="font-display font-medium text-[clamp(32px,3.6vw,46px)] leading-[1.05] tracking-[-0.01em] mt-2.5 mb-10">
                    My <em className="italic font-normal text-wine">Account</em>
                </h1>
            </div>

            <div className="px-[5vw] pb-[100px] grid grid-cols-[1fr_2fr] gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-8">
                {/* LEFT — profile */}
                <div className="bg-white border border-ink/14 p-6 sticky top-[100px] max-[900px]:static">
                    <h2 className="font-display font-medium text-[18px] mb-5">Profile</h2>
                    <div className="space-y-3 mb-6">
                        <div>
                            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-sage block mb-1">Name</span>
                            <p className="text-[14px]">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-sage block mb-1">Email</span>
                            <p className="text-[14px]">{user.email}</p>
                        </div>
                        <div>
                            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-sage block mb-1">Member since</span>
                            <p className="text-[14px]">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/wishlist"
                            className="font-mono text-[11px] tracking-[0.05em] text-wine underline underline-offset-[3px] hover:text-ink"
                        >
                            View wishlist
                        </Link>
                        <button
                            type="button"
                            onClick={() => void handleLogout()}
                            className="font-mono text-[11px] tracking-[0.05em] text-sage underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-wine"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                {/* RIGHT — orders */}
                <div>
                    <h2 className="font-display font-medium text-[20px] mb-5">
                        Order <em className="italic font-normal text-wine">history</em>
                    </h2>

                    {ordersLoading ? (
                        <OrdersSkeleton />
                    ) : ordersError ? (
                        <div className="bg-white border border-wine/20 p-8 text-center">
                            <p className="font-mono text-[12px] text-wine tracking-[0.04em] mb-3">
                                Failed to load orders.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setOrdersLoading(true); setOrdersError(false); void fetchOrders(); }}
                                className="font-mono text-[11px] text-wine underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-ink"
                            >
                                Try again
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white border border-ink/14 p-8 text-center">
                            <p className="font-mono text-[12px] text-sage tracking-[0.04em] mb-4">
                                No orders yet.
                            </p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-ink text-bone px-6 py-3 font-mono text-[11px] tracking-[0.06em] uppercase cursor-pointer hover:bg-wine transition-colors"
                            >
                                Start shopping <span>→</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div key={order._id}>
                                    {expandedOrder === order._id ? (
                                        <OrderDetail order={order} onClose={() => setExpandedOrder(null)} />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setExpandedOrder(order._id)}
                                            className="w-full text-left bg-white border border-ink/14 p-5 cursor-pointer hover:border-ink/30 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-mono text-[11px] text-sage">
                                                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                    </span>
                                                    <p className="font-mono text-[14px] mt-0.5">#{order.orderNumber}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[10px] tracking-wider uppercase mb-1 ${STATUS_STYLES[order.status] || ""}`}>
                                                        {STATUS_LABELS[order.status] || order.status}
                                                    </span>
                                                    <p className="font-mono text-[14px]">{formatPrice(order.total)}</p>
                                                </div>
                                            </div>
                                            <p className="font-mono text-[11px] text-sage">
                                                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                            </p>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
