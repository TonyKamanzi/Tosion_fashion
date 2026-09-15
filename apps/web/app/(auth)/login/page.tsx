import type { Metadata } from "next";
import Auth from "@/components/Auth";

export const metadata: Metadata = {
    title: "Sign In — Tosion",
};

export default function LoginPage() {
    return <Auth />;
}
