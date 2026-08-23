import type { Metadata } from "next";
import Link from "next/link";

type ShopPageProps = {
    params: Promise<{ slug: string }>;
};

// "winter-knits" -> "Winter Knits"
function titleize(value: string) {
    return value
        .split("-")
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
    const { slug } = await params;
    return { title: `${titleize(slug)} — Tosion` };
}

export default async function ShopPage({ params }: ShopPageProps) {
    const { slug } = await params;
    const title = titleize(slug);

    return (
        <div className="bg-bone-2 min-h-[60vh] flex items-center justify-center px-[5vw] py-27.5">
            <div className="text-center max-w-xl">
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-sage mb-5">
                    / shop / {slug}
                </p>
                <h1 className="font-display font-medium text-[clamp(34px,4.4vw,58px)] leading-[1.05] tracking-[-0.01em] mb-5">
                    {title}
                </h1>
                <p className="text-sage text-[14px] leading-[1.6] mb-9">
                    This collection is being curated. Pieces will land here soon —
                    meanwhile, explore the rest of the wardrobe.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-ink text-bone py-3.5 px-7 text-[13px] font-medium tracking-[0.02em] transition-colors hover:bg-wine"
                >
                    Back to homepage
                </Link>
            </div>
        </div>
    );
}
