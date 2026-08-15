import Image from "next/image";

export default function Editorial() {
    return (
        <section className="relative min-h-[76vh] flex items-center justify-center bg-ink overflow-hidden">
            <Image
                src="https://picsum.photos/id/1062/1600/1000"
                alt="Editorial lookbook image"
                fill
                sizes="100vw"
                className="object-cover opacity-[0.42] grayscale-60"
            />
            <div className="relative z-2 text-center text-bone max-w-190 px-5">
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-gold block mb-5.5">
                    The Journal
                </span>
                <h2 className="font-display font-normal italic text-[clamp(28px,4vw,50px)] leading-tight tracking-[-0.01em]">
                    &ldquo;Dressing well isn&apos;t about having more — it&apos;s about
                    choosing pieces that earn their place.&rdquo;
                </h2>
                <cite className="block mt-6.5 font-mono not-italic text-[12px] tracking-[0.08em] text-sage">
                    — Studio notes, AW26 lookbook
                </cite>
            </div>
        </section>
    );
}
