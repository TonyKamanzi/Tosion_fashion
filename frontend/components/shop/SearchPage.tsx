"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ProductCard, { type ShopProduct } from "./ProductCard";

const SORT_OPTIONS = [
    { key: "newest", label: "Newest" },
    { key: "price-asc", label: "Price: low to high" },
    { key: "price-desc", label: "Price: high to low" },
    { key: "name", label: "Name A–Z" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["key"];
type ApiResponse = { items: ShopProduct[]; total: number; page: number; pages: number; limit: number };

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [sort, setSort] = useState<SortKey>("newest");
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(Boolean(initialQuery));
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // auto-focus search input
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const fetchResults = useCallback(async (q: string, p: number, s: SortKey) => {
        if (!q.trim()) {
            setProducts([]);
            setTotal(0);
            setPages(1);
            setSearched(false);
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const { data } = await axios.get<ApiResponse>("http://localhost:2000/products", {
                params: { q: q.trim(), sort: s, page: p, limit: 18 },
            });
            setProducts(data.items);
            setTotal(data.total);
            setPages(data.pages);
        } catch {
            setProducts([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        // update URL
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        router.push(`/search?${params.toString()}`);
        fetchResults(query, 1, sort);
    };

    const handleQueryChange = (value: string) => {
        setQuery(value);
        // debounce search as user types
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            const params = new URLSearchParams();
            if (value.trim()) params.set("q", value.trim());
            router.push(`/search?${params.toString()}`);
            fetchResults(value, 1, sort);
        }, 400);
    };

    const handleSortChange = (newSort: SortKey) => {
        setSort(newSort);
        setPage(1);
        fetchResults(query, 1, newSort);
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        fetchResults(query, p, sort);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="mt-20 bg-bone min-h-[calc(100vh-80px)]">
            {/* search header */}
            <div className="px-[5vw] pt-9 pb-7">
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-wine block mb-2.5">
                    Search
                </span>
                <h1 className="font-display font-medium text-[clamp(32px,3.6vw,46px)] leading-[1.05] tracking-[-0.01em] mb-6">
                    Find your <em className="italic font-normal text-wine">piece</em>
                </h1>

                {/* search input */}
                <form onSubmit={handleSubmit} className="flex gap-0 max-w-[600px]">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 border border-ink/14 border-r-0 bg-none py-3.5 px-4 font-sans text-[14px] text-ink placeholder:text-sage/60 outline-none focus:border-wine transition-colors"
                    />
                    <button
                        type="submit"
                        className="bg-ink text-bone border border-ink px-5 cursor-pointer font-mono text-[11px] tracking-[0.06em] uppercase hover:bg-wine hover:border-wine transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* results */}
            <div className="px-[5vw] pb-[100px]">
                {loading ? (
                    <div className="py-20 text-center font-mono text-[12px] text-sage tracking-[0.04em]">
                        Searching...
                    </div>
                ) : !searched ? (
                    <div className="py-20 text-center">
                        <p className="font-mono text-[12px] text-sage tracking-[0.04em] mb-2">
                            Type above to search products.
                        </p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="font-mono text-[12px] text-sage tracking-[0.04em] mb-2">
                            No results for &ldquo;{query}&rdquo;
                        </p>
                        <p className="text-[13px] text-sage">
                            Try a different search or{" "}
                            <Link href="/shop" className="text-wine underline underline-offset-[3px] hover:text-ink transition-colors">
                                browse the shop
                            </Link>
                        </p>
                    </div>
                ) : (
                    <>
                        {/* results header */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-mono text-[12px] text-sage">
                                {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-sage">Sort:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => handleSortChange(e.target.value as SortKey)}
                                    className="border border-ink/14 bg-bone py-1.5 px-2.5 font-mono text-[11px] text-ink outline-none cursor-pointer"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>

                        {/* pagination */}
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => handlePageChange(p)}
                                        className={`w-9 h-9 flex items-center justify-center border font-mono text-[12px] cursor-pointer transition-colors ${
                                            p === page
                                                ? "bg-ink text-bone border-ink"
                                                : "border-ink/14 text-ink hover:border-ink"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
