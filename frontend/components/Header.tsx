"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
    { href: "/", label: "New In" },
    { href: "/women", label: "Women" },
    { href: "/men", label: "Men" },
    { href: "/assessories", label: "Accessories" },
    { href: "/journal", label: "Journal" },
];

export default function Header() {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-ink/15 bg-bone/90 backdrop-blur-md h-20 fixed w-full z-50">
            <header className="flex justify-between items-center h-full px-4 sm:px-6 md:px-8 lg:mx-20">
                <h1 className="font-display font-semibold text-2xl tracking-[0.02em]">
                    TOSION
                </h1>

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
                    <Link href="/account">Account</Link>
                    <Link
                        className="font-mono text-[11px] tracking-widest border px-3.5 py-2 border-ink hover:bg-ink hover:text-bone transition-colors"
                        href="/bag"
                    >
                        Bag (2)
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
