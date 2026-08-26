"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import axios from "axios";
import { useAdminSession } from "./AdminSessionContext";

type TopbarProps = {
    eyebrow?: string;
    title?: ReactNode;
};

type Notification = {
    id: string;
    message: string;
    time: string;
    read: boolean;
};

function greetingFor(date: Date): string {
    const hours = date.getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
}

export default function Topbar({ eyebrow = "Overview", title }: TopbarProps) {
    const user = useAdminSession();
    const [greeting, setGreeting] = useState(() => greetingFor(new Date()));
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const update = () => setGreeting(greetingFor(new Date()));
        const id = setInterval(update, 60_000);
        return () => clearInterval(id);
    }, []);

    // fetch recent orders as notifications
    useEffect(() => {
        void (async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders`, { withCredentials: true });
                const items = (res.data.items || []).slice(0, 5);
                setNotifications(
                    items.map((o: { _id: string; orderNumber: string; total: number; createdAt: string }) => ({
                        id: o._id,
                        message: `New order #${o.orderNumber} — $${o.total.toLocaleString()}`,
                        time: new Date(o.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                        read: false,
                    }))
                );
            } catch {
                // silent
            }
        })();
    }, []);

    // close dropdown on outside click
    useEffect(() => {
        if (!notifOpen) return;
        const onClickAway = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickAway);
        return () => document.removeEventListener("mousedown", onClickAway);
    }, [notifOpen]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="flex items-center justify-between flex-wrap gap-5 mb-8.5">
            <div>
                <span className="block font-mono text-[10.5px] tracking-[0.18em] uppercase text-wine">
                    {eyebrow}
                </span>
                <h1 suppressHydrationWarning className="mt-1.5 font-display font-medium text-[30px] leading-[1.05] tracking-[-0.01em]">
                    {title ?? (
                        <>
                            {greeting}, <em className="italic text-wine">{user.firstName}</em>
                        </>
                    )}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2.5 bg-bone-2 border border-ink/15 py-2.5 px-4 min-w-70 rounded-sm">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage shrink-0"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                    <input
                        type="text"
                        placeholder="Search orders, products..."
                        className="bg-transparent outline-none font-sans text-[13.5px] text-ink w-full"
                    />
                </label>

                {/* notification bell */}
                <div ref={notifRef} className="relative">
                    <button
                        type="button"
                        aria-label="Notifications"
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="w-9.5 h-9.5 border border-ink/15 flex items-center justify-center relative transition-colors duration-200 hover:border-ink cursor-pointer"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-wine text-bone text-[9px] font-mono flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="animate-fade absolute right-0 top-full mt-3 w-80 bg-white border border-ink/15 shadow-lg z-50">
                            <div className="px-4 py-3 border-b border-ink/15 flex justify-between items-center">
                                <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-sage">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="font-mono text-[10px] text-wine">{unreadCount} new</span>
                                )}
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="px-4 py-6 text-center text-[12px] text-sage">No notifications</p>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`px-4 py-3 border-b border-ink/10 last:border-b-0 ${n.read ? "" : "bg-bone-2/50"}`}
                                        >
                                            <p className="text-[12.5px] leading-snug">{n.message}</p>
                                            <span className="font-mono text-[10px] text-sage mt-1 block">{n.time}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="px-4 py-2.5 border-t border-ink/15 text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                                        setNotifOpen(false);
                                    }}
                                    className="font-mono text-[10.5px] tracking-wider text-wine hover:underline cursor-pointer bg-none border-none"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="flex items-center gap-2 bg-ink text-bone py-3 px-5 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200 hover:bg-wine cursor-pointer"
                >
                    + Add product
                </button>
            </div>
        </div>
    );
}
