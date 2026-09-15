import type { Metadata } from "next";
import ArrivalsManager from "@/components/admin/ArrivalsManager";

export const metadata: Metadata = {
    title: "New Arrivals — Tosion Admin",
};

export default function AdminArrivalsPage() {
    return <ArrivalsManager />;
}
