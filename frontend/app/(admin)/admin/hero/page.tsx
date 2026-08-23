import type { Metadata } from "next";
import HeroManager from "@/components/admin/HeroManager";

export const metadata: Metadata = {
    title: "Hero & Adverts — Tosion Admin",
};

export default function AdminHeroPage() {
    return <HeroManager />;
}
