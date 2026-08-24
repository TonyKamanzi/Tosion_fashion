import Image from "next/image";
import axios from "axios";

type EditorialContent = {
    imageUrl: string;
    imageAlt: string;
    eyebrow: string;
    quote: string;
    attribution: string;
};

// shown if the backend is unreachable — mirrors the seeded defaults
const FALLBACK_EDITORIAL: EditorialContent = {
    imageUrl: "https://picsum.photos/id/1062/1600/1000",
    imageAlt: "Editorial lookbook image",
    eyebrow: "The Journal",
    quote:
        "Dressing well isn't about having more — it's about choosing pieces that earn their place.",
    attribution: "— Studio notes, AW26 lookbook",
};

async function getEditorial(): Promise<EditorialContent> {
    try {
        const res = await axios.get<EditorialContent>(
            "http://localhost:2000/editorial",
            { timeout: 4000 }
        );
        return res.data;
    } catch {
        return FALLBACK_EDITORIAL;
    }
}

export default async function Editorial() {
    const content = await getEditorial();

    return (
        <section className="relative min-h-[76vh] flex items-center justify-center bg-ink overflow-hidden">
            <Image
                src={content.imageUrl}
                alt={content.imageAlt}
                fill
                sizes="100vw"
                className="object-cover opacity-[0.42] grayscale-60"
            />
            <div className="relative z-2 text-center text-bone max-w-190 px-5">
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-gold block mb-5.5">
                    {content.eyebrow}
                </span>
                <h2 className="font-display font-normal italic text-[clamp(28px,4vw,50px)] leading-tight tracking-[-0.01em]">
                    &ldquo;{content.quote}&rdquo;
                </h2>
                <cite className="block mt-6.5 font-mono not-italic text-[12px] tracking-[0.08em] text-sage">
                    {content.attribution}
                </cite>
            </div>
        </section>
    );
}
