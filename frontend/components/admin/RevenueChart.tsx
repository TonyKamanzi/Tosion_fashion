"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Panel from "./Panel";

type WeekData = { label: string; height: number; revenue: number };

export default function RevenueChart() {
    const [weeks, setWeeks] = useState<WeekData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/revenue-chart`, { withCredentials: true });
                setWeeks(res.data.items);
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <Panel title="Revenue — last 8 weeks" href="/admin/analytics">
            <div className="p-6">
                {loading ? (
                    <div className="flex items-end gap-3.5 h-45 pt-2.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end">
                                <div className="w-full max-w-8.5 bg-bone-2 animate-pulse" style={{ height: `${30 + i * 7}%` }}></div>
                                <span className="font-mono text-[10px] text-sage">W{i}</span>
                            </div>
                        ))}
                    </div>
                ) : weeks.length === 0 ? (
                    <p className="text-sm text-sage py-8 text-center">No data yet</p>
                ) : (
                    <div className="flex items-end gap-3.5 h-45 pt-2.5">
                        {weeks.map((week, i) => (
                            <div
                                key={week.label}
                                className="group flex-1 flex flex-col items-center gap-2.5 h-full justify-end"
                            >
                                <div
                                    style={{ height: `${week.height}%` }}
                                    className={`w-full max-w-8.5 transition-colors duration-200 group-hover:bg-gold ${
                                        i === weeks.length - 1 ? "bg-wine" : "bg-bone-2"
                                    }`}
                                    title={`$${week.revenue.toLocaleString()}`}
                                ></div>
                                <span className="font-mono text-[10px] text-sage">{week.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Panel>
    );
}
