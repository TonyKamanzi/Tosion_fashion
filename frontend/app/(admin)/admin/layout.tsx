import type { Metadata } from "next";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";

export const metadata: Metadata = {
    title: "Dashboard — Tosion Admin",
};

// shape returned by GET /auth/me
type SessionUser = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
};

async function getSessionUser(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies();
        const res = await axios.get<SessionUser>("http://localhost:2000/auth/me", {
            headers: { Cookie: cookieStore.toString() },
        });
        return res.data;
    } catch {
        return null;
    }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getSessionUser();

    // fail closed: no session or not an admin goes back to sign in
    if (!user || user.role !== "admin") {
        redirect("/account");
    }

    return (
        <div className="grid grid-cols-1 min-[800px]:grid-cols-[250px_1fr] min-h-screen">
            <Sidebar user={user} />
            <main className="px-5 pt-6 pb-13 min-[800px]:px-10 min-[800px]:pt-7 min-[800px]:pb-16">
                {children}
            </main>
        </div>
    );
}
