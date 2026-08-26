"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/components/shop/CartContext";
import { useCustomerSession } from "@/components/shop/CustomerSessionContext";

const links = [
    { href: "/shop", label: "New In" },
    { href: "/shop/women", label: "Women" },
    { href: "/shop/men", label: "Men" },
    { href: "/shop/accessories", label: "Accessories" },
];

export default function Header() {
    const [open, setOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { items } = useCart();
    const { user, logout } = useCustomerSession();

    // close the account dropdown when clicking outside
    useEffect(() => {
        if (!accountOpen) return;
        const onClickAway = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
                setAccountOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickAway);
        return () => document.removeEventListener("mousedown", onClickAway);
    }, [accountOpen]);

    const handleLogout = async () => {
        await logout();
        setAccountOpen(false);
        toast.success("Logged out", { description: "You've been signed out." });
        router.push("/");
    };

    return (
        <div className="border-b border-ink/15 bg-bone/90 backdrop-blur-md h-20 fixed w-full z-50">
            <header className="flex justify-between items-center h-full px-4 sm:px-6 md:px-8 lg:mx-20">
                <Link href={"/"} className="font-display font-semibold text-2xl tracking-[0.02em]">
                    TOSION
                </Link>

                <nav className="hidden lg:flex gap-9 text-[13px] font-sans tracking-[0.03em]">
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} className="group relative">
                            {link.label}
                            <span className="absolute left-0 -bottom-1 h-px w-0 bg-wine transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                <div className="flex gap-5.5 text-[13px] font-sans items-center">
                    <Link className="hidden sm:inline" href="/search">
                        Search
                    </Link>

                    {/* Logged out: plain Account link · Logged in: first name + dropdown */}
                    {user ? (
                        <div ref={accountRef} className="relative">
                            <button
                                type="button"
                                aria-label="Toggle account menu"
                                onClick={() => setAccountOpen(!accountOpen)}
                                className="flex items-center gap-1.5 hover:text-wine transition-colors cursor-pointer"
                            >
                                {user.firstName}
                                <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className={`transition-transform duration-300 ${accountOpen ? "rotate-180" : ""}`}
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>

                            {accountOpen && (
                                <div className="animate-fade absolute right-0 top-full mt-4 w-56 bg-bone border border-ink/15 shadow-lg">
                                    {/* name + email */}
                                    <div className="px-4 py-3.5 border-b border-ink/15">
                                        <span className="block font-mono text-[9.5px] tracking-[0.22em] uppercase text-gold mb-2">
                                            Signed in
                                        </span>
                                        <p className="font-display font-medium text-[16px] text-ink leading-tight">
                                            {user.firstName} {user.lastName}
                                        </p>
                                        <p className="font-sans text-[12px] text-sage truncate mt-1">
                                            {user.email}
                                        </p>
                                    </div>
                                    {/* wishlist */}
                                    <Link
                                        href="/wishlist"
                                        onClick={() => setAccountOpen(false)}
                                        className="w-full text-left px-4 py-3 font-mono text-[11px] tracking-[0.08em] uppercase text-ink hover:text-wine transition-colors flex items-center justify-between group"
                                    >
                                        Wishlist
                                        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </Link>
                                    {/* orders */}
                                    <Link
                                        href="/account"
                                        onClick={() => setAccountOpen(false)}
                                        className="w-full text-left px-4 py-3 font-mono text-[11px] tracking-[0.08em] uppercase text-ink hover:text-wine transition-colors flex items-center justify-between group"
                                    >
                                        Orders
                                        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </Link>
                                    {/* logout */}
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 font-mono text-[11px] tracking-[0.08em] uppercase text-ink hover:text-wine transition-colors cursor-pointer flex items-center justify-between group"
                                    >
                                        Logout
                                        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login">Account</Link>
                    )}

                    <Link
                        className="font-mono text-[11px] tracking-widest border px-3.5 py-2 border-ink hover:bg-ink hover:text-bone transition-colors"
                        href="/bag"
                        suppressHydrationWarning
                    >
                        Bag (<span suppressHydrationWarning>{items.length}</span>)
                    </Link>
                    <button
                        type="button"
                        aria-label="Toggle menu"
                        onClick={() => setOpen(!open)}
                        className="lg:hidden flex flex-col gap-1.5"
                    >
                        <span className="h-0.5 w-6 bg-ink transition-transform duration-300" />
                        <span className="h-0.5 w-6 bg-ink transition-transform duration-300" />
                        <span className="h-0.5 w-6 bg-ink transition-transform duration-300" />
                    </button>
                </div>
            </header>

            {open && (
                <nav className="lg:hidden border-t border-ink/15 bg-bone px-4 py-4 flex flex-col gap-4 text-[13px] font-sans tracking-[0.03em]">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="group relative w-fit"
                        >
                            {link.label}
                            <span className="absolute left-0 -bottom-1 h-px w-0 bg-wine transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                    <Link
                        href="/search"
                        onClick={() => setOpen(false)}
                        className="group relative w-fit"
                    >
                        Search
                        <span className="absolute left-0 -bottom-1 h-px w-0 bg-wine transition-all duration-300 group-hover:w-full" />
                    </Link>
                </nav>
            )}
        </div>
    );
}
