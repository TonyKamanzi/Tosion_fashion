"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Panel from "./Panel";
import StatusBadge from "./StatusBadge";

type OrderItem = {
    name: string;
    qty: number;
};

type Order = {
    _id: string;
    orderNumber: string;
    items: OrderItem[];
    total: number;
    status: string;
    createdAt: string;
    shipping?: {
        firstName?: string;
        lastName?: string;
        email?: string;
    };
};

const columns = [
    { label: "Order", align: "left" as const },
    { label: "Customer", align: "left" as const },
    { label: "Product", align: "left" as const },
    { label: "Status", align: "left" as const },
    { label: "Date", align: "left" as const },
    { label: "Total", align: "right" as const },
];

export default function OrdersTable() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            try {
                const res = await axios.get(`http://localhost:2000/orders`, { withCredentials: true });
                setOrders((res.data.items || []).slice(0, 6));
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <Panel title="Recent orders" href="/admin/orders">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-190">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.label}
                                    className={`font-mono font-bold text-[10.5px] tracking-[0.08em] uppercase text-sage py-3.5 px-6 border-b border-ink/15 ${
                                        column.align === "right" ? "text-right" : "text-left"
                                    }`}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="[&>tr:last-child>td]:border-b-0">
                        {loading ? (
                            [1, 2, 3, 4, 5, 6].map((i) => (
                                <tr key={i}>
                                    {[1, 2, 3, 4, 5, 6].map((j) => (
                                        <td key={j} className="py-4 px-6 border-b border-ink/15">
                                            <div className="h-3.5 bg-bone-2 animate-pulse rounded"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-sm text-sage">No orders yet</td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const firstName = order.shipping?.firstName ?? "";
                                const lastName = order.shipping?.lastName ?? "";
                                const customerName = `${firstName} ${lastName}`.trim() || "—";
                                const productNames = order.items.map((i) => i.name).join(", ");
                                const date = new Date(order.createdAt);
                                const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

                                return (
                                    <tr key={order._id} className="transition-colors duration-150 hover:bg-bone-2">
                                        <td className="py-4 px-6 border-b border-ink/15 text-[13.5px] font-mono text-sage">
                                            #{order.orderNumber}
                                        </td>
                                        <td className="py-4 px-6 border-b border-ink/15 text-[13.5px]">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-7 h-7 rounded-full bg-bone-2 text-ink flex items-center justify-center font-display text-[11px] font-semibold shrink-0">
                                                    {customerName[0] || "—"}
                                                </span>
                                                {customerName}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 border-b border-ink/15 text-[13.5px]">
                                            <span className="truncate max-w-36 block">{productNames}</span>
                                        </td>
                                        <td className="py-4 px-6 border-b border-ink/15">
                                            <StatusBadge status={order.status as "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"} />
                                        </td>
                                        <td className="py-4 px-6 border-b border-ink/15 text-[13.5px] font-mono">{dateStr}</td>
                                        <td className="py-4 px-6 border-b border-ink/15 text-[13.5px] font-mono text-right">
                                            ${order.total.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Panel>
    );
}
