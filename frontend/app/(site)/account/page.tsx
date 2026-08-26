import type { Metadata } from "next";
import AccountPage from "@/components/shop/AccountPage";

export const metadata: Metadata = {
    title: "My Account — Tosion",
};

export default function Account() {
    return <AccountPage />;
}
