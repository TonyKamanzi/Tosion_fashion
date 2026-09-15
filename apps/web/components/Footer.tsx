import Link from "next/link";

const columns = [
    {
        heading: "Shop",
        links: [
            { href: "/shop", label: "New In" },
            { href: "/shop/women", label: "Women" },
            { href: "/shop/men", label: "Men" },
            { href: "/shop/sale", label: "Sale" },
        ],
    },
    {
        heading: "Support",
        links: [
            { href: "/shipping", label: "Shipping" },
            { href: "/returns", label: "Returns" },
            { href: "/sizeguide", label: "Size Guide" },
            { href: "/contact", label: "Contact" },
        ],
    },
    {
        heading: "Studio",
        links: [
            { href: "/about", label: "About" },
            { href: "/journal", label: "Journal" },
            { href: "/sustainability", label: "Sustainability" },
            { href: "/careers", label: "Careers" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="px-[5vw] pt-20 pb-7.5 bg-bone">
            <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 lg:gap-10 pb-15 border-b border-ink/15">
                <div className="col-span-2 lg:col-span-1">
                    <div className="font-display font-semibold text-2xl tracking-[0.02em] mb-4">
                        TOSION
                    </div>
                    <p className="text-sage text-[13.5px] max-w-[32ch] leading-[1.7]">
                        Small-batch clothing made with natural fibres and a longer wear
                        life in mind. Est. 2019.
                    </p>
                </div>
                {columns.map((col) => (
                    <div key={col.heading} className="footer-col">
                        <h5 className="font-mono text-[11px] tracking-widest uppercase text-sage mb-4.5">
                            {col.heading}
                        </h5>
                        <div>
                            {col.links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block text-[14px] mb-3 text-ink hover:text-wine transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center flex-wrap gap-2.5 pt-6 text-[12px] text-sage font-mono">
                <span>&copy; {new Date().getFullYear()} TOSION STUDIO</span>
                <span>Kigali · Nairobi · Paris</span>
            </div>
        </footer>
    );
}
