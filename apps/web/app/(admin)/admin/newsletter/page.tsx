import type { Metadata } from "next";
import NewsletterManager from "@/components/admin/NewsletterManager";

export const metadata: Metadata = {
    title: "Newsletter — Tosion Admin",
};

export default function AdminNewsletterPage() {
    return <NewsletterManager />;
}
