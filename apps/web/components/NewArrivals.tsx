import Image from "next/image";
import axios from "axios";
import { API_URL } from "@/lib/api";

type ArrivalItem = {
    src: string;
    alt: string;
    // badge on the image corner, e.g. "NEW" or "−20%" (empty = no badge)
    tag: string;
    name: string;
    category: string;
    price: string;
    enabled: boolean;
};

// shown if the backend is unreachable — mirrors the seeded defaults
const FALLBACK_ARRIVALS: ArrivalItem[] = [
    {
        src: "https://images.unsplash.com/photo-1669575903350-9a349b411810?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Model wearing a structured wool coat",
        tag: "NEW",
        name: "Wool Overcoat",
        category: "Outerwear",
        price: "$328",
        enabled: true,
    },
    {
        src: "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Model wearing a textured knit sweater",
        tag: "",
        name: "Ribbed Knit Sweater",
        category: "Knitwear",
        price: "$148",
        enabled: true,
    },
    {
        src: "https://images.unsplash.com/photo-1624378441864-6eda7eac51cb?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Model wearing tailored trousers",
        tag: "−20%",
        name: "Tailored Trousers",
        category: "Bottoms",
        price: "$168",
        enabled: true,
    },
    {
        src: "https://images.unsplash.com/photo-1575403538007-acb790100421?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Elegant fashion accessories and jewelry",
        tag: "",
        name: "Leather Crossbody",
        category: "Accessories",
        price: "$212",
        enabled: true,
    },
];

const FALLBACK_HEADER = {
    title: "New arrivals",
    description: "This week's edit — restocked staples and a few limited runs.",
};

async function getArrivals(): Promise<ArrivalItem[]> {
    try {
        const res = await axios.get<ArrivalItem[]>(`${API_URL}/arrivals`, {
            timeout: 4000,
        });
        return res.data;
    } catch {
        return FALLBACK_ARRIVALS;
    }
}

async function getHeader(): Promise<{ title: string; description: string }> {
    try {
        const res = await axios.get<{
            title: string;
            description: string;
        }>(`${API_URL}/arrivals/header`, { timeout: 4000 });
        return res.data;
    } catch {
        return FALLBACK_HEADER;
    }
}

export default async function NewArrivals() {
    const [fetched, header] = await Promise.all([getArrivals(), getHeader()]);
    const products = fetched.filter((product) => product.enabled);

    // nothing to show when every arrival is hidden
    if (products.length === 0) return null;

    return (
        <section id="collection" className="px-[5vw] py-27.5 bg-bone-2">
            <div className="flex justify-between items-end mb-13 gap-5 flex-wrap">
                <h2 className="font-display font-medium text-[clamp(30px,3.4vw,46px)] leading-[1.05] tracking-[-0.01em]">
                    {header.title}
                </h2>
                <p className="max-w-[38ch] text-sage text-[14px] leading-[1.6]">
                    {header.description}
                </p>
            </div>

            <div className="grid grid-cols-2 min-[900px]:grid-cols-4 gap-y-8.5 gap-x-6.5">
                {products.map((product) => (
                    <div key={product.name} className="group relative">
                        <div className="relative aspect-3/4 overflow-hidden bg-bone-2 mb-4">
                            {product.tag && (
                                <span className="absolute z-10 top-3.5 -right-px bg-wine text-bone font-mono text-[11px] tracking-wider px-2.5 py-1.5 before:absolute before:content-[''] before:top-0 before:-left-2.25 before:border-solid before:border-[14.5px_9px_14.5px_0] before:border-transparent before:border-r-wine">
                                    {product.tag}
                                </span>
                            )}
                            <Image
                                src={product.src}
                                alt={product.alt}
                                fill
                                sizes="(min-width: 900px) 25vw, 50vw"
                                className="object-cover transition-transform duration-600 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.06]"
                            />
                            <div className="absolute z-10 left-3 right-3 bottom-3 bg-bone text-ink text-center py-3 font-mono text-[11px] tracking-[0.08em] uppercase opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                Quick add
                            </div>
                        </div>
                        <div className="flex justify-between items-start gap-2.5">
                            <div>
                                <h4 className="font-sans font-medium text-[14.5px] mb-1">
                                    {product.name}
                                </h4>
                                <span className="text-[12px] text-sage">
                                    {product.category}
                                </span>
                            </div>
                            <span className="font-mono text-[13px]">{product.price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
