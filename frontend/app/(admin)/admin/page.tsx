import Topbar from "@/components/admin/Topbar";
import StatCards from "@/components/admin/StatCards";
import RevenueChart from "@/components/admin/RevenueChart";
import TopProducts from "@/components/admin/TopProducts";
import OrdersTable from "@/components/admin/OrdersTable";

export default function AdminPage() {
    return (
        <div>
            <Topbar />
            <StatCards />
            <div className="grid grid-cols-1 min-[1100px]:grid-cols-[1.6fr_1fr] gap-6 mb-6">
                <RevenueChart />
                <TopProducts />
            </div>
            <OrdersTable />
        </div>
    );
}
