import type { Metadata } from "next";
import DiscountManager from "@/components/admin/DiscountManager";

export const metadata: Metadata = {
    title: "Discounts — Tosion Admin",
};

export default function AdminDiscountsPage() {
    return <DiscountManager />;
}
