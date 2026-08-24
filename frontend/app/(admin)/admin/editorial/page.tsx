import type { Metadata } from "next";
import EditorialManager from "@/components/admin/EditorialManager";

export const metadata: Metadata = {
    title: "Editorial — Tosion Admin",
};

export default function AdminEditorialPage() {
    return <EditorialManager />;
}
