import Image from "next/image";
import Link from "next/link";


const categories = [
    {
        href: "/shop/outerwear",
        src: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85",
        alt: "Woman wearing a structured coat",
        eyebrow: "01 — Layers",
        label: "Outerwear",
    },
    {
        href: "/shop/knitwear",
        src: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85",
        alt: "Woman wearing a knit sweater",
        eyebrow: "02 — Softwear",
        label: "Knitwear",
    },
    {
        href: "/shop/accessories",
        src: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
        alt: "Fashion accessories and jewelry",
        eyebrow: "03 — Details",
        label: "Accessories",
    },
    {
        href: "/shop/tops",
        src: "https://images.unsplash.com/photo-1651383740069-6be2f8e74d87?q=80&w=710&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Woman wearing a white blouse",
        eyebrow: "04 — Essentials",
        label: "Tops",
    }, 
    {
        href: "/shop/dresses",
        src: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
        alt: "Woman wearing an elegant dress",
        eyebrow: "05 — Silhouettes",
        label: "Dresses",
    },
    {
        href: "/shop/bottoms",
        src: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85",
        alt: "Woman wearing wide-leg trousers",
        eyebrow: "06 — Foundations",
        label: "Bottoms",
    },
];

export default function Category() {

    
    return (
        <div>
            <div className="px-[5vw] pt-27.5 pb-0.5">
                <div className="flex justify-between items-end mb-13 gap-5 flex-wrap">
                    <h2 className="font-display font-medium text-[clamp(30px,3.4vw,46px)] leading-[1.05] tracking-[-0.01em]">
                        Shop by category
                    </h2>
                    <p className="max-w-[38ch] text-sage text-[14px] leading-[1.6]">
                        Three edits, one wardrobe. Built around what you&apos;ll actually
                        reach for.
                    </p>
                </div>
            </div>

            <div className="grid gap-0.5 grid-cols-1 min-[900px]:grid-cols-[1.3fr_1fr_1fr] min-[900px]:h-[70vh] min-[900px]:min-h-130">
                {categories.map((cat) => (
                    <Link
                        key={cat.label}
                        href={cat.href}
                        className="group relative overflow-hidden bg-ink h-70 min-[900px]:h-auto"
                    >
                        <Image
                            src={cat.src}
                            alt={cat.alt}
                            fill
                            sizes="(min-width: 900px) 33vw, 100vw"
                            className="object-cover grayscale-20 transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.08]"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.55)_100%)]" />
                        <div className="absolute left-6 bottom-6 z-2 text-bone">
                            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-bone-2 block mb-1.5">
                                {cat.eyebrow}
                            </span>
                            <h3 className="font-display font-medium text-[26px] leading-[1.05] tracking-[-0.01em]">
                                {cat.label}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
