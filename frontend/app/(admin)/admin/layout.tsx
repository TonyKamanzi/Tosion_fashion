import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard — Tosion Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 min-[800px]:grid-cols-[250px_1fr] min-h-screen">
            <aside className="hidden min-[800px]:block bg-ink"></aside>
            <main className="px-5 pt-6 pb-13 min-[800px]:px-10 min-[800px]:pt-7 min-[800px]:pb-16">
                {children}
            </main>
        </div>
    );
}
