import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import axios from "axios";
import ShopListing from "@/components/shop/ShopListing";
import type { ShopProduct } from "@/components/shop/ProductCard";
import type { CategoryCount } from "@/components/shop/ShopSidebar";
import { API_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

type ShopCategoryPageProps = {
    params: Promise<{ slug: string }>;
};

// navbar lines served by the same page: /shop/women and /shop/men
const DEPARTMENTS = ["women", "men"] as const;
const DEPARTMENT_LABELS: Record<string, string> = { women: "Women", men: "Men" };

type CategoryDoc = {
    _id: string;
    label: string;
    slug: string;
    eyebrow: string;
    description?: string;
    enabled: boolean;
};

type ProductsResponse = {
    items: ShopProduct[];
    total: number;
    page: number;
    pages: number;
    limit: number;
};

async function getCategory(slug: string): Promise<CategoryDoc | null> {
    try {
        const res = await axios.get<CategoryDoc[]>(`${API_URL}/categories`, {
            timeout: 6000,
        });
        return res.data.find((cat) => cat.slug === slug) ?? null;
    } catch {
        return null;
    }
}

async function getProducts(slug: string, department?: string): Promise<ProductsResponse> {
    const query = department
        ? `department=${encodeURIComponent(department)}`
        : `category=${encodeURIComponent(slug)}`;
    try {
        const res = await axios.get<ProductsResponse>(
            `${API_URL}/products?${query}&limit=100`,
            { timeout: 6000 }
        );
        return res.data;
    } catch {
        return { items: [], total: 0, page: 1, pages: 1, limit: 9 };
    }
}

async function getCounts(): Promise<CategoryCount[]> {
    try {
        const res = await axios.get<CategoryCount[]>(`${API_URL}/products/counts`, {
            timeout: 6000,
        });
        return res.data;
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: ShopCategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    if ((DEPARTMENTS as readonly string[]).includes(slug)) {
        return { title: `${DEPARTMENT_LABELS[slug]} — Tosion` };
    }
    const category = await getCategory(slug);
    return { title: `${category ? category.label : "Shop"} — Tosion` };
}

export default async function ShopCategoryPage({ params }: ShopCategoryPageProps) {
    const { slug } = await params;
    const isDepartment = (DEPARTMENTS as readonly string[]).includes(slug);
    const departmentLabel = isDepartment ? DEPARTMENT_LABELS[slug] : null;

    const [category, productsData, counts] = await Promise.all([
        isDepartment ? Promise.resolve(null) : getCategory(slug),
        getProducts(slug, isDepartment ? slug : undefined),
        getCounts(),
    ]);

    // unknown category slug → 404
    if (!isDepartment && !category) notFound();

    const label = isDepartment ? (departmentLabel as string) : (category as CategoryDoc).label;

    // "Winter Knits" -> "Winter <em>Knits</em>" like the template's h1
    const words = label.split(" ");
    const lastWord = words.pop() ?? "";
    const head = words.length > 0 ? `${words.join(" ")} ` : "";

    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            {/* page head */}
            <div className="px-[5vw] pt-11 pb-8.5 border-b border-ink/15">
                <p className="font-mono text-[11px] tracking-[0.06em] text-sage mb-5.5">
                    <Link href="/" className="hover:text-wine transition-colors">
                        Home
                    </Link>
                    {isDepartment ? (
                        <>
                            <span className="mx-2 opacity-50">/</span>
                            <span>{label}</span>
                        </>
                    ) : (
                        <>
                            <span className="mx-2 opacity-50">/</span>
                            <Link href="/shop" className="hover:text-wine transition-colors">
                                New In
                            </Link>
                            <span className="mx-2 opacity-50">/</span>
                            <span>{label}</span>
                        </>
                    )}
                </p>
                <div className="flex justify-between items-end gap-5 flex-wrap">
                    <div>
                        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine block">
                            {isDepartment
                                ? "Autumn / Winter 2026"
                                : (category as CategoryDoc).eyebrow || "Collection"}
                        </span>
                        <h1 className="font-display font-medium text-[clamp(38px,4.6vw,60px)] leading-[1.05] tracking-[-0.01em] mt-2.5">
                            {head}
                            <em className="italic font-normal text-wine">{lastWord}</em>
                        </h1>
                        {!isDepartment && (category as CategoryDoc).description?.trim() !== "" && (
                            <p className="text-sage text-[14px] max-w-[42ch] mt-3 leading-[1.6]">
                                {(category as CategoryDoc).description}
                            </p>
                        )}
                    </div>
                    <span className="font-mono text-[12px] text-sage">
                        {productsData.total} {productsData.total === 1 ? "piece" : "pieces"}
                    </span>
                </div>
            </div>

            <ShopListing
                products={productsData.items}
                counts={counts}
                currentSlug={isDepartment ? slug : (category as CategoryDoc).slug}
                lockedDepartment={isDepartment ? slug : undefined}
            />
        </div>
    );
}
