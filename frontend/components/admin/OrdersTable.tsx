import Panel from "./Panel";
import StatusBadge, { type OrderStatus } from "./StatusBadge";

type Order = {
    id: string;
    customer: string;
    product: string;
    status: OrderStatus;
    date: string;
    total: string;
};

const orders: Order[] = [
    { id: "#MN-3021", customer: "Lena Kouassi", product: "Wool Overcoat", status: "fulfilled", date: "Aug 21, 2026", total: "$328.00" },
    { id: "#MN-3020", customer: "Rian Okafor", product: "Ribbed Knit Sweater", status: "pending", date: "Aug 21, 2026", total: "$148.00" },
    { id: "#MN-3019", customer: "Sofia Mendes", product: "Leather Crossbody", status: "fulfilled", date: "Aug 20, 2026", total: "$212.00" },
    { id: "#MN-3018", customer: "Théo Laurent", product: "Tailored Trousers", status: "cancelled", date: "Aug 20, 2026", total: "$168.00" },
    { id: "#MN-3017", customer: "Naledi Dube", product: "Wool Overcoat", status: "fulfilled", date: "Aug 19, 2026", total: "$328.00" },
    { id: "#MN-3016", customer: "Julien Roche", product: "Ribbed Knit Sweater", status: "pending", date: "Aug 19, 2026", total: "$148.00" },
];

const columns = [
    { label: "Order", align: "left" },
    { label: "Customer", align: "left" },
    { label: "Product", align: "left" },
    { label: "Status", align: "left" },
    { label: "Date", align: "left" },
    { label: "Total", align: "right" },
] as const;

export default function OrdersTable() {
    return (
        <Panel title="Recent orders" link="View all orders">
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
                        {orders.map((order) => (
                            <tr key={order.id} className="transition-colors duration-150 hover:bg-bone-2">
                                <td className="py-4 px-6 border-b border-ink/15 text-[13.5px] font-mono text-sage">
                                    {order.id}
                                </td>
                                <td className="py-4 px-6 border-b border-ink/15 text-[13.5px]">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-7 h-7 rounded-full bg-bone-2 text-ink flex items-center justify-center font-display text-[11px] font-semibold shrink-0">
                                            {order.customer[0]}
                                        </span>
                                        {order.customer}
                                    </div>
                                </td>
                                <td className="py-4 px-6 border-b border-ink/15 text-[13.5px]">{order.product}</td>
                                <td className="py-4 px-6 border-b border-ink/15">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="py-4 px-6 border-b border-ink/15 text-[13.5px] font-mono">{order.date}</td>
                                <td className="py-4 px-6 border-b border-ink/15 text-[13.5px] font-mono text-right">
                                    {order.total}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Panel>
    );
}
