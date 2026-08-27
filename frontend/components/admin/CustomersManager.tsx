"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";

type Customer = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    orderCount: number;
    totalSpent: number;
};

export default function CustomersManager() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            try {
                const res = await axios.get(`${API_URL}/admin/customers`, { withCredentials: true });
                setCustomers(res.data.items);
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display font-medium text-[clamp(28px,3vw,38px)] leading-[1.05] tracking-[-0.01em]">
                    Customers
                </h1>
                <p className="font-mono text-[11px] tracking-wider text-sage mt-2">
                    {customers.length} registered customer{customers.length !== 1 ? "s" : ""}
                </p>
            </div>

            <div className="bg-white border border-ink/15 overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                        <tr>
                            {["Customer", "Email", "Joined", "Orders", "Total spent"].map((label) => (
                                <th
                                    key={label}
                                    className="font-mono font-bold text-[10.5px] tracking-[0.08em] uppercase text-sage py-3.5 px-6 border-b border-ink/15 text-left"
                                >
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <tr key={i}>
                                    {[1, 2, 3, 4, 5].map((j) => (
                                        <td key={j} className="py-4 px-6 border-b border-ink/15">
                                            <div className="h-3.5 bg-bone-2 animate-pulse rounded w-20"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-sm text-sage">No customers yet</td>
                            </tr>
                        ) : (
                            customers.map((c) => (
                                <tr key={c._id} className="hover:bg-bone-2 transition-colors">
                                    <td className="py-4 px-6 border-b border-ink/15">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-8 h-8 rounded-full bg-bone-2 text-ink flex items-center justify-center font-display text-[11px] font-semibold shrink-0">
                                                {(c.firstName[0] || "").toUpperCase()}
                                            </span>
                                            <span className="text-[13.5px]">{c.firstName} {c.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 border-b border-ink/15 text-[13px] text-sage">{c.email}</td>
                                    <td className="py-4 px-6 border-b border-ink/15 text-[13px] font-mono">
                                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </td>
                                    <td className="py-4 px-6 border-b border-ink/15 text-[13px] font-mono">{c.orderCount}</td>
                                    <td className="py-4 px-6 border-b border-ink/15 text-[13px] font-mono">
                                        ${c.totalSpent.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
