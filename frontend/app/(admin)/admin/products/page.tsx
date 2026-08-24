import type { Metadata } from "next";
import ProductsManager from "@/components/admin/ProductsManager";

export const metadata: Metadata = {
    title: "Products — Tosion Admin",
};

export default function AdminProductsPage() {
    return <ProductsManager />;
}
