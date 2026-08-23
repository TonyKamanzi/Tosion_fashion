import type { ReactNode } from "react";

type Stat = {
    label: string;
    value: string;
    delta: string;
    trend: "up" | "down";
    icon: ReactNode;
};

const stats: Stat[] = [
    {
        label: "Revenue this month",
        value: "$48,290",
        delta: "↑ 12.4%",
        trend: "up",
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        ),
    },
    {
        label: "Orders this month",
        value: "612",
        delta: "↑ 8.1%",
        trend: "up",
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L22 6H6" /></svg>
        ),
    },
    {
        label: "Active customers",
        value: "2,847",
        delta: "↑ 3.6%",
        trend: "up",
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
        ),
    },
    {
        label: "Conversion rate",
        value: "3.4%",
        delta: "↓ 1.2%",
        trend: "down",
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>
        ),
    },
];

export default function StatCards() {
    return (
        <div className="grid grid-cols-1 min-[800px]:grid-cols-2 min-[1100px]:grid-cols-4 gap-5 mb-9">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-ink/15 pt-[22px] px-[22px] pb-5">
                    <div className="flex justify-between items-start mb-[18px]">
                        <div className="w-[34px] h-[34px] bg-bone-2 flex items-center justify-center text-wine">
                            {stat.icon}
                        </div>
                        <span
                            className={`font-mono text-[11px] py-[3px] px-2 flex items-center gap-1 ${
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
