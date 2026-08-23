import Panel from "./Panel";

const weeks = [
    { label: "W1", height: 52 },
    { label: "W2", height: 64 },
    { label: "W3", height: 46 },
    { label: "W4", height: 78 },
    { label: "W5", height: 58 },
    { label: "W6", height: 88 },
    { label: "W7", height: 70 },
    { label: "W8", height: 100, highlight: true },
];

export default function RevenueChart() {
    return (
        <Panel title="Revenue — last 8 weeks" link="View report">
            <div className="p-6">
                <div className="flex items-end gap-3.5 h-[180px] pt-2.5">
                    {weeks.map((week) => (
                        <div
                            key={week.label}
                            className="group flex-1 flex flex-col items-center gap-2.5 h-full justify-end"
                        >
                            <div
                                style={{ height: `${week.height}%` }}
                                className={`w-full max-w-[34px] transition-colors duration-200 group-hover:bg-gold ${
                                    week.highlight ? "bg-wine" : "bg-bone-2"
                                }`}
                            ></div>
                            <span className="font-mono text-[10px] text-sage">{week.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Panel>
    );
}
