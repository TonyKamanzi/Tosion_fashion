"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
    label: string;
    href: string;
    icon: ReactNode;
    badge?: number;
};

const navGroups: { label: string; items: NavItem[] }[] = [
    {
        label: "Overview",
        items: [
            {
                label: "Dashboard",
                href: "/admin",
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                ),
            },
            {
                label: "Orders",
                href: "/admin/orders",
                badge: 12,
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L22 6H6" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></svg>
                ),
            },
            {
                label: "Products",
                href: "/admin/products",
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 8L12 3 3 8v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>
                ),
            },
            {
                label: "Customers",
                href: "/admin/customers",
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                ),
            },
        ],
    },
    {
        label: "Manage",
        items: [
            {
                label: "Discounts",
                href: "/admin/discounts",
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L4 3v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l3.59-3.59a2 2 0 0 0 0-2.59z" /><circle cx="8" cy="8" r="1" /></svg>
                ),
            },
            {
                label: "Analytics",
                href: "/admin/analytics",
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                ),
            },
            {
                label: "Settings",
                href: "/admin/settings",
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                ),
            },
        ],
    },
];

const user = { name: "Amara Diallo", role: "Store Admin" };

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden min-[800px]:flex flex-col sticky top-0 h-screen bg-ink text-bone px-5 py-6.5">
            <div className="font-display font-semibold text-[22px] pt-1.5 px-2 pb-6.5 border-b border-bone/10 mb-5.5">
                MAISON <span className="text-gold">admin</span>
            </div>

            {navGroups.map((group) => (
                <nav key={group.label} className="mb-6.5">
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-bone/40 px-2 pb-2.5">
                        {group.label}
                    </div>
                    {group.items.map((item) => {
                        const isActive =
                            item.href === "/admin"
                                ? pathname === item.href
                                : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 py-2.75 px-2.5 rounded-sm text-sm transition-colors duration-200 mb-0.5 hover:bg-bone/5 hover:text-bone ${
                                    isActive ? "bg-wine text-bone" : "text-bone/70"
                                }`}
                            >
                                <span className="shrink-0 opacity-80">{item.icon}</span>
                                {item.label}
                                {item.badge !== undefined && (
                                    <span className="ml-auto bg-bone/15 text-bone font-mono text-[10px] px-1.75 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            ))}

            <div className="mt-auto pt-5 border-t border-bone/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold text-ink flex items-center justify-center font-display font-semibold text-sm shrink-0">
                    {user.name[0]}
                </div>
                <div>
                    <div className="text-[13.5px] font-medium">{user.name}</div>
                    <div className="text-[11.5px] text-bone/50">{user.role}</div>
                </div>
            </div>
        </aside>
    );
}
