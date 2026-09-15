"use client";

import { useMemo, useState } from "react";
import ProductCard, { type ShopProduct } from "./ProductCard";
import ShopSidebar, {
    PRICE_RANGES,
    type CategoryCount,
    type ColorOption,
    type PriceKey,
    type SizeOption,
} from "./ShopSidebar";

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
    { key: "newest", label: "Newest" },
    { key: "price-asc", label: "Price: low to high" },
    { key: "price-desc", label: "Price: high to low" },
    { key: "name", label: "Name A–Z" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["key"];

type ShopListingProps = {
    products: ShopProduct[];
    counts: CategoryCount[];
    currentSlug: string; // "all" on /shop, else the category slug
    // when set ("women"|"men") the listing stays inside the line and the
    // sidebar Category checkboxes become client-side filters
    lockedDepartment?: string;
};

function toggleValue(list: string[], value: string) {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function ShopListing({
    products,
    counts,
    currentSlug,
    lockedDepartment,
}: ShopListingProps) {
    const [sort, setSort] = useState<SortKey>("newest");
    const [view, setView] = useState<"grid" | "list">("grid");
    const [page, setPage] = useState(1);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedHexes, setSelectedHexes] = useState<string[]>([]);
    const [selectedPrices, setSelectedPrices] = useState<PriceKey[]>([]);
    const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

    // within a line: type-category options derived from what's loaded
    const slugOptions = useMemo(() => {
        if (!lockedDepartment) return [];
        const bySlug = new Map<string, { slug: string; label: string; count: number }>();
        for (const product of products) {
            const cat = product.category;
            if (!cat || !cat.slug) continue;
            const existing = bySlug.get(cat.slug);
            if (existing) existing.count += 1;
            else bySlug.set(cat.slug, { slug: cat.slug, label: cat.label, count: 1 });
        }
        return [...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label));
    }, [products, lockedDepartment]);

    // filter option lists derived from what's actually in this category
    const sizeOptions: SizeOption[] = useMemo(() => {
        const bySize = new Map<string, number>();
        for (const product of products) {
            for (const size of product.sizes) {
                bySize.set(size, (bySize.get(size) ?? 0) + 1);
            }
        }
        return [...bySize.entries()]
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => a.value.localeCompare(b.value));
    }, [products]);

    const colorOptions: ColorOption[] = useMemo(() => {
        const byHex = new Map<string, ColorOption>();
        for (const product of products) {
            for (const color of product.colors) {
                const existing = byHex.get(color.hex);
                if (existing) existing.count += 1;
                else byHex.set(color.hex, { hex: color.hex, name: color.name, count: 1 });
            }
        }
        return [...byHex.values()];
    }, [products]);

    const priceCounts = useMemo(() => {
        const result = { "under-100": 0, "100-250": 0, "over-250": 0 } as Record<PriceKey, number>;
        for (const range of PRICE_RANGES) {
            result[range.key] = products.filter((p) => range.test(p.price)).length;
        }
        return result;
    }, [products]);

    const filtersActive =
        selectedSizes.length > 0 ||
        selectedHexes.length > 0 ||
        selectedPrices.length > 0 ||
        selectedSlugs.length > 0;

    const visible = useMemo(() => {
        let list = products;

        if (selectedSlugs.length > 0) {
            list = list.filter(
                (p) => p.category && selectedSlugs.includes(p.category.slug),
            );
        }
        if (selectedSizes.length > 0) {
            list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
        }
        if (selectedHexes.length > 0) {
            list = list.filter((p) => p.colors.some((c) => selectedHexes.includes(c.hex)));
        }
        if (selectedPrices.length > 0) {
            const activeRanges = PRICE_RANGES.filter((r) => selectedPrices.includes(r.key));
            list = list.filter((p) => activeRanges.some((r) => r.test(p.price)));
        }

        const sorted = [...list];
        if (sort === "newest") {
            sorted.sort((a, b) => b._id.localeCompare(a._id)); // ObjectId order ≈ creation order
        } else if (sort === "price-asc") {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sort === "price-desc") {
            sorted.sort((a, b) => b.price - a.price);
        } else {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }

        return sorted;
    }, [products, selectedSlugs, selectedSizes, selectedHexes, selectedPrices, sort]);

    const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    const safePage = Math.min(page, pages);
    const pageItems = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // every filter/sort change lands the customer back on page one
    const resetPage = () => setPage(1);

    const handleSort = (key: SortKey) => {
        setSort(key);
        resetPage();
    };

    const toggleSize = (size: string) => {
        setSelectedSizes((prev) => toggleValue(prev, size));
        resetPage();
    };

    const toggleColor = (hex: string) => {
        setSelectedHexes((prev) => toggleValue(prev, hex));
        resetPage();
    };

    const togglePrice = (key: PriceKey) => {
        setSelectedPrices((prev) => toggleValue(prev, key) as PriceKey[]);
        resetPage();
    };

    const toggleSlug = (slug: string) => {
        setSelectedSlugs((prev) => toggleValue(prev, slug));
        resetPage();
    };

    const clearFilters = () => {
        setSelectedSizes([]);
        setSelectedHexes([]);
        setSelectedPrices([]);
        setSelectedSlugs([]);
        resetPage();
    };

    return (
        <div className="grid grid-cols-1 min-[900px]:grid-cols-[240px_1fr] gap-12 px-[5vw] pt-10 pb-[100px]">
            <ShopSidebar
                counts={counts}
                currentSlug={currentSlug}
                lockedDepartment={lockedDepartment}
                slugOptions={slugOptions}
                selectedSlugs={selectedSlugs}
                onToggleSlug={toggleSlug}
                onClearSlugs={() => {
                    setSelectedSlugs([]);
                    resetPage();
                }}
                sizeOptions={sizeOptions}
                colorOptions={colorOptions}
                selectedSizes={selectedSizes}
                onToggleSize={toggleSize}
                selectedHexes={selectedHexes}
                onToggleColor={toggleColor}
                selectedPrices={selectedPrices}
                priceCounts={priceCounts}
                onTogglePrice={togglePrice}
                filtersActive={filtersActive}
                onClearFilters={clearFilters}
            />

            <div>
                {/* sort bar */}
                <div className="flex justify-between items-center gap-4 flex-wrap mb-8">
                    <label className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.05em] uppercase border border-ink px-3.5 py-2.5 cursor-pointer">
                        Sort by:
                        <select
                            value={sort}
                            onChange={(e) => handleSort(e.target.value as SortKey)}
                            className="bg-transparent outline-none cursor-pointer font-mono text-[11px] tracking-[0.05em] uppercase text-ink"
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            title="Grid view"
                            aria-label="Grid view"
                            aria-pressed={view === "grid"}
                            onClick={() => setView("grid")}
                            className={`w-[34px] h-[34px] border flex items-center justify-center cursor-pointer transition-colors ${
                                view === "grid"
                                    ? "border-ink text-ink"
                                    : "border-ink/15 text-sage hover:text-ink"
                            }`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                        </button>
                        <button
                            type="button"
                            title="List view"
                            aria-label="List view"
                            aria-pressed={view === "list"}
                            onClick={() => setView("list")}
                            className={`w-[34px] h-[34px] border flex items-center justify-center cursor-pointer transition-colors ${
                                view === "list"
                                    ? "border-ink text-ink"
                                    : "border-ink/15 text-sage hover:text-ink"
                            }`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        </button>
                    </div>
                </div>

                {/* body */}
                {products.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-ink/20 bg-bone-2/50 px-5">
                        <p className="font-display italic text-[clamp(22px,2.6vw,32px)] text-sage mb-3">
                            No products added yet.
                        </p>
                        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-sage/80">
                            Pieces added from the admin panel will appear here.
                        </p>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-ink/20 bg-bone-2/50 px-5">
                        <p className="font-display italic text-[clamp(22px,2.6vw,32px)] text-sage mb-3">
                            No pieces match your filters.
                        </p>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="font-mono text-[11px] tracking-[0.05em] uppercase text-wine underline underline-offset-3 cursor-pointer"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : view === "grid" ? (
                    <div className="grid grid-cols-2 min-[900px]:grid-cols-3 gap-x-6.5 gap-y-9">
                        {pageItems.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {pageItems.map((product) => (
                            <ProductCard key={product._id} product={product} view="list" />
                        ))}
                    </div>
                )}

                {/* pagination */}
                {pages > 1 && (
                    <nav className="flex justify-center items-center gap-2.5 mt-17.5 font-mono text-[13px]">
                        <button
                            type="button"
                            aria-label="Previous page"
                            disabled={safePage === 1}
                            onClick={() => setPage(safePage - 1)}
                            className="min-w-9 h-9 px-3.5 border border-ink/15 text-sage transition-colors hover:border-ink hover:text-ink disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                            ←
                        </button>
                        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                type="button"
                                aria-label={`Page ${n}`}
                                aria-current={n === safePage ? "page" : undefined}
                                onClick={() => setPage(n)}
                                className={`w-9 h-9 border transition-colors cursor-pointer ${
                                    n === safePage
                                        ? "border-ink bg-ink text-bone"
                                        : "border-ink/15 text-sage hover:border-ink hover:text-ink"
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={safePage === pages}
                            onClick={() => setPage(safePage + 1)}
                            className="min-w-9 h-9 px-3.5 border border-ink/15 text-sage transition-colors hover:border-ink hover:text-ink disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                            Next →
                        </button>
                    </nav>
                )}
            </div>
        </div>
    );
}
