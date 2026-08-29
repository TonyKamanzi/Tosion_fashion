"use client";

import axios from "axios";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import AdminSessionProvider, {
    type AdminUser,
} from "@/components/admin/AdminSessionContext";
import { Toaster } from "sonner";
import { API_URL } from "@/lib/api";

export default function AdminGate({ children }: { children: ReactNode }) {
    // undefined = still resolving · AdminUser = signed in admin · null = not authorized
    const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
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

    if (user === undefined || user === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bone">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-wine border-t-transparent" />
            </div>
        );
    }

    return (
        <AdminSessionProvider user={user}>
            <div className="grid grid-cols-1 min-[800px]:grid-cols-[250px_1fr] min-h-screen">
                <Sidebar />
                <main className="px-5 pt-6 pb-13 min-[800px]:px-10 min-[800px]:pt-7 min-[800px]:pb-16">
                    {children}
                </main>
            </div>
            <Toaster position="top-right" theme="light" richColors />
        </AdminSessionProvider>
    );
}