import Image from "next/image";
import axios from "axios";

type MarqueeItem = {
    text: string;
    enabled: boolean;
};

// shape returned by GET /hero
type HeroContent = {
    imageUrl: string;
    imageAlt: string;
    badge: string;
    eyebrow: string;
    headlinePre: string;
    headlineItalic: string;
    headlinePost: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    marqueeItems: MarqueeItem[];
};

// shown if the backend is unreachable — mirrors the seeded defaults
const FALLBACK_HERO_CONTENT: HeroContent = {
    imageUrl: "https://picsum.photos/id/1027/1200/1400/",
    imageAlt: "Model wearing new season outerwear",
    badge: "In stock — ships in 48h",
    eyebrow: "Autumn / Winter 2026",
    headlinePre: "Cut for",
    headlineItalic: "quiet",
    headlinePost: "confidence.",
    description:
        "Considered silhouettes in natural fibres, made in small batches. Fewer pieces, worn longer.",
    ctaLabel: "Shop the collection",
    ctaHref: "#collection",
    marqueeItems: [
        { text: "FREE SHIPPING OVER $150", enabled: true },
        { text: "NEW ARRIVALS WEEKLY", enabled: true },
        { text: "MADE TO LAST", enabled: true },
        { text: "EASY 30-DAY RETURNS", enabled: true },
    ],
};

async function getHeroContent(): Promise<HeroContent> {
    try {
        const res = await axios.get<HeroContent>("http://localhost:2000/hero", {
            timeout: 4000,
        });
        return res.data;
    } catch {
        return FALLBACK_HERO_CONTENT;
    }
}

export default async function Hero() {
    const content = await getHeroContent();

    // admins toggle individual marquee items; hide the strip when none are active
    const activeMarqueeItems = content.marqueeItems.filter((item) => item.enabled);

    return (
        <div className="mt-20">
            <section className="grid grid-cols-1 min-[900px]:grid-cols-[1.15fr_0.85fr] min-h-[calc(100vh-5rem)] border-b border-ink/15">
                <div className="relative overflow-hidden bg-ink">
                    <Image
                        src={content.imageUrl}
                        alt={content.imageAlt}
                        fill
                        sizes="50vw"
                        priority
                        className="object-cover  grayscale-35 contrast-[1.05] "
                    />
                    {content.badge && (
                        <div className="absolute bottom-7 left-7 font-mono text-[11px] text-bone tracking-widest flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7FBF7F] shadow-[0_0_0_3px_rgba(127,191,127,0.25)]" />
                            {content.badge}
                        </div>
                    )}
                </div>
                <div className="flex flex-col justify-center px-[6vw] py-13 min-[900px]:px-[4.5vw] min-[900px]:py-[8vw] border-t min-[900px]:border-t-0 min-[900px]:border-l border-ink/15 bg-bone-2">
                    {content.eyebrow && (
                        <span className="font-mono text-[11px] tracking-widest uppercase text-wine">
                            {content.eyebrow}
                        </span>
                    )}
                    <h1 className="font-display font-medium text-[clamp(42px,5.2vw,76px)] leading-[1.05] tracking-[-0.01em] mt-4.5 mb-6">
                        {content.headlinePre}
                        <br />
                        <em className="italic font-normal text-wine">{content.headlineItalic}</em>{" "}
                        {content.headlinePost}
                    </h1>
                    <p className="max-w-[34ch] text-sage text-[15px] leading-[1.7] mb-8.5">
                        {content.description}
                    </p>
                    {content.ctaLabel && (
                        <a
                            href={content.ctaHref || "#collection"}
                            className="group inline-flex items-center gap-3 bg-ink text-bone px-6.5 py-4 w-fit text-[13px] tracking-[0.04em] transition-colors hover:bg-wine"
                        >
                            {content.ctaLabel}
                            <span className="transition-transform duration-300 group-hover:translate-x-1.25">
                                →
                            </span>
                        </a>
                    )}
                </div>
            </section>

            {activeMarqueeItems.length > 0 && (
                <div className="bg-wine text-bone overflow-hidden whitespace-nowrap border-b border-ink/15">
                    <div className="inline-flex items-center animate-scroll py-4">
                        {[...activeMarqueeItems, ...activeMarqueeItems].map((item, i) => (
                            <span key={i} className="inline-flex items-center">
                                <span className="font-display italic font-normal text-[20px] px-7 whitespace-nowrap">
                                    {item.text}
                                </span>
                                <span className="font-mono not-italic text-gold text-[16px]">
                                    ✦
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
