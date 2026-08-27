"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";

type Stats = {
    revenue: { value: number; delta: number };
    orders: { value: number; delta: number };
    customers: { value: number; delta: number };
    conversion: { value: number; delta: number };
};

type WeekData = { label: string; revenue: number; orderCount: number; height: number };

type TopProduct = { name: string; sold: number; revenue: number; delta: number };

export default function AnalyticsManager() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [chart, setChart] = useState<WeekData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            try {
                const [statsRes, chartRes, productsRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/stats`, { withCredentials: true }),
                    axios.get(`${API_URL}/admin/revenue-chart`, { withCredentials: true }),
                    axios.get(`${API_URL}/admin/top-products`, { withCredentials: true }),
                ]);
                setStats(statsRes.data);
                setChart(chartRes.data.items);
                setTopProducts(productsRes.data.items);
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
                    Analytics
                </h1>
                <p className="font-mono text-[11px] tracking-wider text-sage mt-2">
                    Performance overview
                </p>
            </div>

            {loading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 min-[800px]:grid-cols-2 min-[1100px]:grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white border border-ink/15 p-6 animate-pulse">
                                <div className="h-3 bg-bone-2 w-24 mb-3"></div>
                                <div className="h-8 bg-bone-2 w-20 mb-2"></div>
                                <div className="h-3 bg-bone-2 w-16"></div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white border border-ink/15 p-6 animate-pulse h-64"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* summary cards */}
                    {stats && (
                        <div className="grid grid-cols-1 min-[800px]:grid-cols-2 min-[1100px]:grid-cols-4 gap-5">
                            {[
                                { label: "Revenue", value: `$${stats.revenue.value.toLocaleString()}`, delta: stats.revenue.delta },
                                { label: "Orders", value: String(stats.orders.value), delta: stats.orders.delta },
                                { label: "Customers", value: String(stats.customers.value), delta: stats.customers.delta },
                                { label: "Conversion", value: `${stats.conversion.value}%`, delta: stats.conversion.delta },
                            ].map((card) => (
                                <div key={card.label} className="bg-white border border-ink/15 p-6">
                                    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-sage block mb-2">{card.label}</span>
                                    <span className="font-sans text-[28px] leading-tight block">{card.value}</span>
                                    <span className={`font-mono text-[11px] mt-1 block ${card.delta >= 0 ? "text-good" : "text-wine"}`}>
                                        {card.delta >= 0 ? "↑" : "↓"} {Math.abs(card.delta)}% this month
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* revenue chart */}
                    <div className="bg-white border border-ink/15">
                        <div className="py-5 px-6 border-b border-ink/15">
                            <h3 className="font-display font-medium text-lg">Revenue — last 8 weeks</h3>
                        </div>
                        <div className="p-6">
                            {chart.length === 0 ? (
                                <p className="text-sm text-sage text-center py-8">No data yet</p>
                            ) : (
                                <div className="flex items-end gap-3.5 h-48">
                                    {chart.map((week, i) => (
                                        <div key={week.label} className="group flex-1 flex flex-col items-center gap-2.5 h-full justify-end">
                                            <div
                                                style={{ height: `${week.height}%` }}
                                                className={`w-full max-w-8.5 transition-colors group-hover:bg-gold ${i === chart.length - 1 ? "bg-wine" : "bg-bone-2"}`}
                                                title={`$${week.revenue.toLocaleString()} — ${week.orderCount} orders`}
                                            ></div>
                                            <span className="font-mono text-[10px] text-sage">{week.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* top products */}
                    <div className="bg-white border border-ink/15">
                        <div className="py-5 px-6 border-b border-ink/15">
                            <h3 className="font-display font-medium text-lg">Top products</h3>
                        </div>
                        <div className="p-6">
                            {topProducts.length === 0 ? (
                                <p className="text-sm text-sage text-center py-4">No data yet</p>
                            ) : (
                                <div className="space-y-0">
                                    {topProducts.map((p, i) => (
                                        <div key={p.name} className={`flex items-center gap-4 py-3.5 ${i < topProducts.length - 1 ? "border-b border-ink/15" : ""}`}>
                                            <span className="font-mono text-[11px] text-sage w-5">{i + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13.5px] font-medium truncate">{p.name}</p>
                                                <p className="text-[11px] text-sage">{p.sold} units sold</p>
                                            </div>
                                            <div className="font-mono text-[13px] text-right">
                                                ${p.revenue.toLocaleString()}
                                                <span className={`block text-[10.5px] mt-0.5 ${p.delta >= 0 ? "text-good" : "text-wine"}`}>
                                                    {p.delta >= 0 ? "↑" : "↓"} {Math.abs(p.delta)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
