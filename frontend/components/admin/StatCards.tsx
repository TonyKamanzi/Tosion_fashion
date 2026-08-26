"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Stat = {
    label: string;
    value: string;
    delta: string;
    trend: "up" | "down";
    icon: JSX.Element;
};

const icons: { [k: string]: JSX.Element } = {
    revenue: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    ),
    orders: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L22 6H6" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></svg>
    ),
    customers: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
    ),
    conversion: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>
    ),
};

const skeleton = (
    <div className="grid grid-cols-1 min-[800px]:grid-cols-2 min-[1100px]:grid-cols-4 gap-5 mb-9">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-ink/15 pt-5.5 px-5.5 pb-5 animate-pulse">
                <div className="w-8.5 h-8.5 bg-bone-2 mb-4.5"></div>
                <div className="h-8 bg-bone-2 w-28 mb-2"></div>
                <div className="h-3 bg-bone-2 w-20"></div>
            </div>
        ))}
    </div>
);

export default function StatCards() {
    const [stats, setStats] = useState<Stat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { withCredentials: true });
                const d = res.data;
                setStats([
                    {
                        label: "Revenue this month",
                        value: `$${Number(d.revenue.value).toLocaleString()}`,
                        delta: `${d.revenue.delta >= 0 ? "↑" : "↓"} ${Math.abs(d.revenue.delta)}%`,
                        trend: d.revenue.delta >= 0 ? "up" : "down",
                        icon: icons.revenue,
                    },
                    {
                        label: "Orders this month",
                        value: String(d.orders.value),
                        delta: `${d.orders.delta >= 0 ? "↑" : "↓"} ${Math.abs(d.orders.delta)}%`,
                        trend: d.orders.delta >= 0 ? "up" : "down",
                        icon: icons.orders,
                    },
                    {
                        label: "Active customers",
                        value: Number(d.customers.value).toLocaleString(),
                        delta: `${d.customers.delta >= 0 ? "↑" : "↓"} ${Math.abs(d.customers.delta)}%`,
                        trend: d.customers.delta >= 0 ? "up" : "down",
                        icon: icons.customers,
                    },
                    {
                        label: "Conversion rate",
                        value: `${d.conversion.value}%`,
                        delta: `${d.conversion.delta >= 0 ? "↑" : "↓"} ${Math.abs(d.conversion.delta)}%`,
                        trend: d.conversion.delta >= 0 ? "up" : "down",
                        icon: icons.conversion,
                    },
                ]);
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return skeleton;

    return (
        <div className="grid grid-cols-1 min-[800px]:grid-cols-2 min-[1100px]:grid-cols-4 gap-5 mb-9">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-ink/15 pt-5.5 px-5.5 pb-5">
                    <div className="flex justify-between items-start mb-4.5">
                        <div className="w-8.5 h-8.5 bg-bone-2 flex items-center justify-center text-wine">
                            {stat.icon}
                        </div>
                        <span
                            className={`font-mono text-[11px] py-0.75 px-2 flex items-center gap-1 ${
                                stat.trend === "up" ? "text-good bg-good/10" : "text-wine bg-wine/8"
                            }`}
                        >
                            {stat.delta}
                        </span>
                    </div>
                    <div className="font-sans text-[30px] leading-tight mb-1.5">{stat.value}</div>
                    <div className="text-[12.5px] text-sage">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}
