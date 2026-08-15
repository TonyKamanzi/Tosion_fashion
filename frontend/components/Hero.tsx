import Image from "next/image";

const marqueeItems = [
    "FREE SHIPPING OVER $150",
    "NEW ARRIVALS WEEKLY",
    "MADE TO LAST",
    "EASY 30-DAY RETURNS",
];

export default function Hero() {
    return (
        <div className="mt-20">
            <section className="grid grid-cols-1 min-[900px]:grid-cols-[1.15fr_0.85fr] min-h-[calc(100vh-5rem)] border-b border-ink/15">
                <div className="relative overflow-hidden bg-ink">
                    <Image
                        src="https://picsum.photos/id/1027/1200/1400/"
                        alt="Model wearing new season outerwear"
                        fill
                        sizes="50vw"
                        priority
                        className="object-cover  grayscale-35 contrast-[1.05] scale-[1.02]"
                    />
                    <div className="absolute bottom-7 left-7 font-mono text-[11px] text-bone tracking-widest flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7FBF7F] shadow-[0_0_0_3px_rgba(127,191,127,0.25)]" />
                        In stock — ships in 48h
                    </div>
                </div>
                <div className="flex flex-col justify-center px-[6vw] py-13 min-[900px]:px-[4.5vw] min-[900px]:py-[8vw] border-t min-[900px]:border-t-0 min-[900px]:border-l border-ink/15 bg-bone-2">
                    <span className="font-mono text-[11px] tracking-widest uppercase text-wine">
                        Autumn / Winter 2026
                    </span>
                    <h1 className="font-display font-medium text-[clamp(42px,5.2vw,76px)] leading-[1.05] tracking-[-0.01em] mt-4.5 mb-6">
                        Cut for
                        <br />
                        <em className="italic font-normal text-wine">quiet</em> confidence.
                    </h1>
                    <p className="max-w-[34ch] text-sage text-[15px] leading-[1.7] mb-8.5">
                        Considered silhouettes in natural fibres, made in small batches.
                        Fewer pieces, worn longer.
                    </p>
                    <a
                        href="#collection"
                        className="group inline-flex items-center gap-3 bg-ink text-bone px-6.5 py-4 w-fit text-[13px] tracking-[0.04em] transition-colors hover:bg-wine"
                    >
                        Shop the collection
                        <span className="transition-transform duration-300 group-hover:translate-x-1.25">
                            →
                        </span>
                    </a>
                </div>
            </section>

            <div className="bg-wine text-bone overflow-hidden whitespace-nowrap border-b border-ink/15">
                <div className="inline-flex items-center animate-scroll py-4">
                    {[...marqueeItems, ...marqueeItems].map((item, i) => (
                        <span key={i} className="inline-flex items-center">
                            <span className="font-display italic font-normal text-[20px] px-7 whitespace-nowrap">
                                {item}
                            </span>
                            <span className="font-mono not-italic text-gold text-[16px]">
                                ✦
                            </span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
