type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const statusStyles: Record<OrderStatus, string> = {
    pending: "text-gold bg-gold/12",
    confirmed: "text-blue-600 bg-blue-500/10",
    shipped: "text-wine bg-wine/8",
    delivered: "text-good bg-good/10",
    cancelled: "text-sage bg-ink/8",
};

const statusLabels: Record<OrderStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
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
