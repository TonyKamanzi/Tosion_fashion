import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { API_URL } from "@/lib/api";

type CategoryItem = {
    label: string;
    slug: string;
    eyebrow: string;
    imageUrl: string;
    imageAlt: string;
    enabled: boolean;
};

// shown if the backend is unreachable — mirrors the seeded defaults
const FALLBACK_CATEGORIES: CategoryItem[] = [
    {
        label: "Outerwear",
        slug: "outerwear",
        eyebrow: "01 — Layers",
        imageUrl:
            "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85",
        imageAlt: "Woman wearing a structured coat",
        enabled: true,
    },
    {
        label: "Knitwear",
        slug: "knitwear",
        eyebrow: "02 — Softwear",
        imageUrl:
            "https://images.unsplash.com/photo-1687275167528-5aac76c3e782?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        imageAlt: "Woman wearing a knit sweater",
        enabled: true,
    },
    {
        label: "Accessories",
        slug: "accessories",
        eyebrow: "03 — Details",
        imageUrl:
            "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
        imageAlt: "Fashion accessories and jewelry",
        enabled: true,
    },
    {
        label: "Tops",
        slug: "tops",
        eyebrow: "04 — Essentials",
        imageUrl:
            "https://images.unsplash.com/photo-1651383740069-6be2f8e74d87?q=80&w=710&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        imageAlt: "Woman wearing a white blouse",
        enabled: true,
    },
    {
        label: "Dresses",
        slug: "dresses",
        eyebrow: "05 — Silhouettes",
        imageUrl:
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
        imageAlt: "Woman wearing an elegant dress",
        enabled: true,
    },
    {
        label: "Bottoms",
        slug: "bottoms",
        eyebrow: "06 — Foundations",
        imageUrl:
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85",
        imageAlt: "Woman wearing wide-leg trousers",
        enabled: true,
    },
];

// shown if the backend is unreachable — mirrors the seeded singleton
const FALLBACK_HEADER = {
    title: "Shop by category",
    description:
        "Three edits, one wardrobe. Built around what you'll actually reach for.",
};

async function getCategories(): Promise<CategoryItem[]> {
    try {
        const res = await axios.get<CategoryItem[]>(`${API_URL}/categories`, {
            timeout: 4000,
        });
        return res.data;
    } catch {
        return FALLBACK_CATEGORIES;
    }
}

async function getHeader(): Promise<{ title: string; description: string }> {
    try {
        const res = await axios.get<{
            title: string;
            description: string;
        }>(`${API_URL}/categories/header`, { timeout: 4000 });
        return res.data;
    } catch {
        return FALLBACK_HEADER;
    }
}

export default async function Category() {
    const [fetched, header] = await Promise.all([getCategories(), getHeader()]);
    const categories = fetched.filter((cat) => cat.enabled);

    // nothing to show when every category is hidden
    if (categories.length === 0) return null;

    return (
        <div>
            <div className="px-[5vw] pt-27.5 pb-0.5 bg-bone-2">
                <div className="flex justify-between items-end mb-13 gap-5 flex-wrap">
                    <h2 className="font-display font-medium text-[clamp(30px,3.4vw,46px)] leading-[1.05] tracking-[-0.01em]">
                        {header.title}
                    </h2>
                    <p className="max-w-[38ch] text-sage text-[14px] leading-[1.6]">
                        {header.description}
                    </p>
                </div>
            </div>

            <div className="grid gap-0.5 grid-cols-1 min-[900px]:grid-cols-[1.3fr_1fr_1fr]">
                {categories.map((cat) => (
                    <Link
                        key={cat.slug}
                        href={`/shop/${cat.slug}`}
                        className="group relative overflow-hidden bg-ink h-70 min-[900px]:h-[35vh] min-[900px]:min-h-[260px]"
                    >
                        <Image
                            src={cat.imageUrl}
                            alt={cat.imageAlt}
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
