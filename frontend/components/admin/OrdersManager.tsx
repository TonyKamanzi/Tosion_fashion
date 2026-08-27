"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { API_URL } from "@/lib/api";

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
    user: { _id: string; firstName: string; lastName: string; email: string };
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
        email: string;
        phone: string;
        address1: string;
        address2: string;
        city: string;
        state: string;
        postal: string;
        country: string;
    };
    promoCode: string;
};

function formatPrice(value: number) {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-gold/15 text-gold",
    confirmed: "bg-blue-500/15 text-blue-600",
    shipped: "bg-wine/15 text-wine",
    delivered: "bg-good/15 text-good",
    cancelled: "bg-ink/8 text-sage",
};

export default function OrdersManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            const url = filter
                ? `${API_URL}/orders?status=${filter}`
                : `${API_URL}/orders`;
            const { data } = await axios.get<{ items: Order[] }>(url, { withCredentials: true });
            setOrders(data.items);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        void (async () => { await fetchOrders(); })();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        try {
            await axios.put(
                `${API_URL}/orders/${orderId}/status`,
                { status: newStatus },
                { withCredentials: true }
            );
            void fetchOrders();
        } catch {
            // ignore
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="p-8 font-mono text-[12px] text-sage">
                Loading orders...
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[900px]">
            <h1 className="font-display font-medium text-[26px] mb-1">Orders</h1>
            <p className="font-mono text-[11px] text-sage mb-8">
                Manage and track customer orders.
            </p>

            {/* status filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    type="button"
                    onClick={() => setFilter("")}
                    className={`px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] uppercase cursor-pointer border transition-colors ${
                        filter === ""
                            ? "bg-ink text-bone border-ink"
                            : "bg-none text-sage border-ink/15 hover:border-ink/40"
                    }`}
                >
                    All ({orders.length})
                </button>
                {STATUS_OPTIONS.map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] uppercase cursor-pointer border transition-colors ${
                            filter === s
                                ? "bg-ink text-bone border-ink"
                                : "bg-none text-sage border-ink/15 hover:border-ink/40"
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {orders.length === 0 ? (
                <div className="bg-white border border-ink/14 p-8 text-center">
                    <p className="font-mono text-[12px] text-sage">
                        No orders{filter ? ` with status "${filter}"` : ""}.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white border border-ink/14">
                            {/* header row */}
                            <button
                                type="button"
                                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                className="w-full text-left p-5 cursor-pointer hover:bg-bone/30 transition-colors"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-mono text-[14px]">{order.orderNumber}</span>
                                            <span className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] tracking-wider uppercase ${STATUS_STYLES[order.status] || ""}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-sage truncate">
                                            {order.user.firstName} {order.user.lastName} — {order.user.email}
                                        </p>
                                        <p className="font-mono text-[11px] text-sage mt-0.5">
                                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            {" · "}{order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                            {order.promoCode && <> · Code: {order.promoCode}</>}
                                        </p>
                                    </div>
                                    <span className="font-mono text-[16px] shrink-0">{formatPrice(order.total)}</span>
                                </div>
                            </button>

                            {/* expanded detail */}
                            {expandedOrder === order._id && (
                                <div className="border-t border-ink/14 p-5">
                                    <div className="grid grid-cols-2 gap-6 max-[700px]:grid-cols-1">
                                        {/* items */}
                                        <div>
                                            <h4 className="font-mono text-[10px] tracking-[0.14em] uppercase text-sage mb-3">
                                                Items
                                            </h4>
                                            <div className="flex flex-col gap-3">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex gap-3 pb-3 border-b border-ink/10 last:border-b-0 last:pb-0">
                                                        <div className="w-10 h-[48px] shrink-0 bg-bone-2 overflow-hidden relative">
                                                            <Image
                                                                src={item.imageUrl || "https://picsum.photos/100/130"}
                                                                alt={item.name}
                                                                fill
                                                                sizes="40px"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-sans text-[12.5px] font-medium truncate">{item.name}</p>
                                                            <p className="font-mono text-[10.5px] text-sage">
                                                                {item.selectedColor?.name}
                                                                {item.selectedColor && item.selectedSize && " · "}
                                                                {item.selectedSize}
                                                                {item.qty > 1 && ` × ${item.qty}`}
                                                            </p>
                                                        </div>
                                                        <span className="font-mono text-[12px] shrink-0">{formatPrice(item.price * item.qty)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* totals */}
                                            <div className="mt-3 space-y-1">
                                                <div className="flex justify-between text-[12px] text-sage">
                                                    <span>Subtotal</span>
                                                    <span className="font-mono">{formatPrice(order.subtotal)}</span>
                                                </div>
                                                <div className="flex justify-between text-[12px] text-sage">
                                                    <span>Shipping</span>
                                                    <span className="font-mono">{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
                                                </div>
                                                <div className="flex justify-between text-[12px] text-sage">
                                                    <span>Tax</span>
                                                    <span className="font-mono">{formatPrice(order.tax)}</span>
                                                </div>
                                                {order.discount > 0 && (
                                                    <div className="flex justify-between text-[12px] text-good">
                                                        <span>Discount</span>
                                                        <span className="font-mono">-{formatPrice(order.discount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-[13px] font-medium pt-1.5 border-t border-ink/14">
                                                    <span>Total</span>
                                                    <span className="font-mono">{formatPrice(order.total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* shipping + status update */}
                                        <div>
                                            <h4 className="font-mono text-[10px] tracking-[0.14em] uppercase text-sage mb-3">
                                                Shipping
                                            </h4>
                                            <div className="text-[13px] mb-5">
                                                <p>{order.shipping.firstName} {order.shipping.lastName}</p>
                                                <p className="text-sage">{order.shipping.address1}</p>
                                                {order.shipping.address2 && <p className="text-sage">{order.shipping.address2}</p>}
                                                <p className="text-sage">
                                                    {order.shipping.city}{order.shipping.state && `, ${order.shipping.state}`} {order.shipping.postal}
                                                </p>
                                                <p className="text-sage">{order.shipping.country}</p>
                                                <p className="text-sage mt-1">{order.shipping.email} · {order.shipping.phone}</p>
                                            </div>

                                            <h4 className="font-mono text-[10px] tracking-[0.14em] uppercase text-sage mb-3">
                                                Update status
                                            </h4>
                                            <div className="flex gap-2 flex-wrap">
                                                {STATUS_OPTIONS.map((s) => (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => void handleStatusChange(order._id, s)}
                                                        disabled={updating === order._id || order.status === s}
                                                        className={`px-3 py-1.5 font-mono text-[10px] tracking-[0.06em] uppercase cursor-pointer border transition-colors disabled:opacity-40 ${
                                                            order.status === s
                                                                ? "bg-ink text-bone border-ink"
                                                                : "bg-none text-sage border-ink/15 hover:border-ink/40"
                                                        }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
