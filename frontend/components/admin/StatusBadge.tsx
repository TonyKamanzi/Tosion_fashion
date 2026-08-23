type OrderStatus = "fulfilled" | "pending" | "cancelled";

const statusStyles: Record<OrderStatus, string> = {
    fulfilled: "text-good bg-good/10",
    pending: "text-gold bg-gold/12",
    cancelled: "text-wine bg-wine/8",
};

const statusLabels: Record<OrderStatus, string> = {
    fulfilled: "Fulfilled",
    pending: "Pending",
    cancelled: "Cancelled",
};

export type { OrderStatus };

export default function StatusBadge({ status }: { status: OrderStatus }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.04em] uppercase py-1.25 px-2.5 ${statusStyles[status]}`}
        >
            <span className="w-1.25 h-1.25 rounded-full bg-current"></span>
            {statusLabels[status]}
        </span>
    );
}
