"use client";

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import axios from "axios";
import { useAdminSession } from "./AdminSessionContext";

type TopbarProps = {
    eyebrow?: string;
    title?: ReactNode;
};

type Notification = {
    _id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    href: string;
    createdAt: string;
};

function greetingFor(date: Date): string {
    const hours = date.getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
}

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const NOTIF_ICONS: Record<string, ReactElement> = {
    new_order: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L22 6H6" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></svg>
    ),
    order_status: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    ),
    review: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
    ),
    system: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
    ),
};

export default function Topbar({ eyebrow = "Overview", title }: TopbarProps) {
    const user = useAdminSession();
    const [greeting, setGreeting] = useState(() => greetingFor(new Date()));
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifLoading, setNotifLoading] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const update = () => setGreeting(greetingFor(new Date()));
        const id = setInterval(update, 60_000);
        return () => clearInterval(id);
    }, []);

    // fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await axios.get("http://localhost:2000/notifications", { withCredentials: true });
            setNotifications(res.data.items);
            setUnreadCount(res.data.unreadCount);
        } catch {
            // silent
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get("http://localhost:2000/notifications", { withCredentials: true });
                setNotifications(res.data.items);
                setUnreadCount(res.data.unreadCount);
            } catch {
                // silent
            }
        };
        void load();
        const id = setInterval(() => {
            void load();
        }, 30000);
        return () => clearInterval(id);
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

    const handleMarkAllRead = async () => {
        try {
            await axios.put("http://localhost:2000/notifications/read", {}, { withCredentials: true });
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {
            // silent
        }
    };

    const handleToggleNotif = async () => {
        const opening = !notifOpen;
        setNotifOpen(opening);
        if (opening) {
            setNotifLoading(true);
            await fetchNotifications();
            setNotifLoading(false);
        }
    };

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
                        onClick={() => void handleToggleNotif()}
                        className="w-9.5 h-9.5 border border-ink/15 flex items-center justify-center relative transition-colors duration-200 hover:border-ink cursor-pointer"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-wine text-bone text-[9px] font-mono flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="animate-fade absolute right-0 top-full mt-3 w-80 bg-white border border-ink/15 shadow-lg z-50">
                            <div className="px-4 py-3 border-b border-ink/15 flex justify-between items-center">
                                <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-sage">Notifications</span>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => void handleMarkAllRead()}
                                        className="font-mono text-[10px] text-wine hover:underline cursor-pointer bg-none border-none"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifLoading ? (
                                    <div className="px-4 py-6 space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className="h-3 bg-bone-2 w-3/4 mb-1.5"></div>
                                                <div className="h-2.5 bg-bone-2 w-1/2"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <p className="px-4 py-8 text-center text-[12px] text-sage">No notifications yet</p>
                                ) : (
                                    notifications.map((n) => {
                                        const Wrapper = n.href ? Link : "div";
                                        const wrapperProps = n.href ? { href: n.href } : {};
                                        return (
                                            <Wrapper
                                                key={n._id}
                                                {...wrapperProps}
                                                onClick={() => {
                                                    setNotifOpen(false);
                                                    if (!n.read) {
                                                        void axios.put(`http://localhost:2000/notifications/${n._id}/read`, {}, { withCredentials: true });
                                                        setNotifications((prev) => prev.map((x) => x._id === n._id ? { ...x, read: true } : x));
                                                        setUnreadCount((prev) => Math.max(0, prev - 1));
                                                    }
                                                }}
                                                className={`flex items-start gap-3 px-4 py-3 border-b border-ink/10 last:border-b-0 transition-colors hover:bg-bone-2/50 ${!n.read ? "bg-bone-2/30" : ""} ${n.href ? "cursor-pointer" : ""}`}
                                            >
                                                <span className="mt-0.5 shrink-0 text-sage">
                                                    {NOTIF_ICONS[n.type] || NOTIF_ICONS.system}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[12.5px] font-medium leading-snug">{n.title}</p>
                                                    <p className="text-[11px] text-sage leading-snug mt-0.5">{n.message}</p>
                                                    <span className="font-mono text-[9.5px] text-sage/70 mt-1 block">{timeAgo(n.createdAt)}</span>
                                                </div>
                                                {!n.read && (
                                                    <span className="w-2 h-2 rounded-full bg-wine shrink-0 mt-1.5"></span>
                                                )}
                                            </Wrapper>
                                        );
                                    })
                                )}
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
