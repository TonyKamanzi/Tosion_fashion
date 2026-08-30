"use client";

import axios from "axios";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminSessionProvider, {
    type AdminUser,
} from "@/components/admin/AdminSessionContext";
import { Toaster } from "sonner";
import { API_URL } from "@/lib/api";

export default function AdminGate({ children }: { children: ReactNode }) {
    // undefined = still resolving · AdminUser = signed in admin · null = not authorized
    const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    // Resolve the session from the browser so the cross-site sessionId cookie is
    // sent natively. A server-side cookie forward can never see the backend's
    // cookie (different domain), which is what used to bounce admins to /account.
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const res = await axios.get<AdminUser>(`${API_URL}/auth/me`, {
                    withCredentials: true,
                });
                if (!cancelled) {
                    setUser(res.data.role === "admin" ? res.data : null);
                }
            } catch {
                if (!cancelled) setUser(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Missing/invalid session or non-admin → back to the account page.
    useEffect(() => {
        if (user === null) {
            router.replace("/account");
        }
    }, [user, router]);

    // Lock the body scroll while the mobile drawer is open.
    useEffect(() => {
        if (!sidebarOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [sidebarOpen]);

    if (user === undefined || user === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bone">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-wine border-t-transparent" />
            </div>
        );
    }

    return (
        <AdminSessionProvider user={user}>
            {/* Mobile top bar — hamburger toggle for the sidebar drawer */}
            <div className="min-[800px]:hidden sticky top-0 z-40 flex items-center justify-between bg-ink text-bone px-5 py-4">
                <div className="font-display font-semibold text-[20px]">
                    TOSION <span className="text-gold">admin</span>
                </div>
                <button
                    type="button"
                    aria-label="Open menu"
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col gap-1.5 border border-bone/15 px-3 py-2.5 cursor-pointer hover:border-bone transition-colors"
                >
                    <span className="h-0.5 w-5 bg-bone"></span>
                    <span className="h-0.5 w-5 bg-bone"></span>
                    <span className="h-0.5 w-5 bg-bone"></span>
                </button>
            </div>

            <div className="grid grid-cols-1 min-[800px]:grid-cols-[250px_1fr] min-h-[calc(100vh-64px)] min-[800px]:min-h-screen">
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="px-5 pt-6 pb-13 min-[800px]:px-10 min-[800px]:pt-7 min-[800px]:pb-16">
                    {children}
                </main>
            </div>
            <Toaster position="top-right" theme="light" richColors />
        </AdminSessionProvider>
    );
}