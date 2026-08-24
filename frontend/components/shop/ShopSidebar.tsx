"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type CategoryCount = {
    slug: string;
    label: string;
    count: number;
};

export type SizeOption = {
    value: string;
    count: number;
};

export type ColorOption = {
    hex: string;
    name: string;
    count: number;
};

export const PRICE_RANGES = [
    { key: "under-100", label: "Under $100", test: (p: number) => p < 100 },
    { key: "100-250", label: "$100 – $250", test: (p: number) => p >= 100 && p <= 250 },
    { key: "over-250", label: "$250+", test: (p: number) => p > 250 },
] as const;

export type PriceKey = (typeof PRICE_RANGES)[number]["key"];

type ShopSidebarProps = {
    counts: CategoryCount[];
    currentSlug: string; // "all" on /shop
    sizeOptions: SizeOption[];
    colorOptions: ColorOption[];
    selectedSizes: string[];
    onToggleSize: (size: string) => void;
    selectedHexes: string[];
    onToggleColor: (hex: string) => void;
    selectedPrices: PriceKey[];
    priceCounts: Record<PriceKey, number>;
    onTogglePrice: (key: PriceKey) => void;
    filtersActive: boolean;
    onClearFilters: () => void;
};

function FilterGroup({
    title,
    collapsed,
    onToggle,
    children,
}: {
    title: string;
    collapsed: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="py-5.5 border-b border-ink/15 first:pt-0">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={!collapsed}
                className="w-full flex justify-between items-center font-mono text-[11px] tracking-[0.1em] uppercase cursor-pointer text-ink"
            >
                {title}
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-sage transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            {!collapsed && <div className="mt-4">{children}</div>}
        </div>
    );
}

export default function ShopSidebar({
    counts,
    currentSlug,
    sizeOptions,
    colorOptions,
    selectedSizes,
    onToggleSize,
    selectedHexes,
    onToggleColor,
    selectedPrices,
    priceCounts,
    onTogglePrice,
    filtersActive,
    onClearFilters,
}: ShopSidebarProps) {
    const router = useRouter();
    const [catCollapsed, setCatCollapsed] = useState(false);
    const [sizeCollapsed, setSizeCollapsed] = useState(false);
    const [colorCollapsed, setColorCollapsed] = useState(false);
    const [priceCollapsed, setPriceCollapsed] = useState(true);

    // checking a category navigates to its page — single-select like routes
    const go = (slug: string) => {
        if (slug === currentSlug) return;
        router.push(slug === "all" ? "/shop" : `/shop/${slug}`);
    };

    return (
        <aside className="hidden min-[900px]:block border-r border-ink/15 pr-10">
            <FilterGroup
                title="Category"
                collapsed={catCollapsed}
                onToggle={() => setCatCollapsed((v) => !v)}
            >
                <div className="flex flex-col gap-3">
                    <label className="flex items-center justify-between text-[13.5px] cursor-pointer">
                        <span className="flex items-center gap-2.5">
                            <input
                                type="checkbox"
                                className="w-3.5 h-3.5 accent-wine"
                                checked={currentSlug === "all"}
                                onChange={() => go("all")}
                            />
                            All pieces
                        </span>
                        <span className="text-sage font-mono text-[11px]">
                            {counts.reduce((sum, c) => sum + c.count, 0)}
                        </span>
                    </label>
                    {counts.map((cat) => (
                        <label
                            key={cat.slug}
                            className="flex items-center justify-between text-[13.5px] cursor-pointer"
                        >
                            <span className="flex items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 accent-wine"
                                    checked={currentSlug === cat.slug}
                                    onChange={() => go(cat.slug)}
                                />
                                {cat.label}
                            </span>
                            <span className="text-sage font-mono text-[11px]">{cat.count}</span>
                        </label>
                    ))}
                </div>
            </FilterGroup>

            {sizeOptions.length > 0 && (
                <FilterGroup
                    title="Size"
                    collapsed={sizeCollapsed}
                    onToggle={() => setSizeCollapsed((v) => !v)}
                >
                    <div className="flex flex-col gap-3">
                        {sizeOptions.map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center justify-between text-[13.5px] cursor-pointer"
                            >
                                <span className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 accent-wine"
                                        checked={selectedSizes.includes(option.value)}
                                        onChange={() => onToggleSize(option.value)}
                                    />
                                    {option.value}
                                </span>
                                <span className="text-sage font-mono text-[11px]">{option.count}</span>
                            </label>
                        ))}
                    </div>
                </FilterGroup>
            )}

            {colorOptions.length > 0 && (
                <FilterGroup
                    title="Color"
                    collapsed={colorCollapsed}
                    onToggle={() => setColorCollapsed((v) => !v)}
                >
                    <div className="flex flex-wrap gap-2">
                        {colorOptions.map((option) => (
                            <button
                                key={option.hex}
                                type="button"
                                title={`${option.name || option.hex} (${option.count})`}
                                aria-label={`Filter by ${option.name || option.hex}`}
                                aria-pressed={selectedHexes.includes(option.hex)}
                                onClick={() => onToggleColor(option.hex)}
                                style={{ backgroundColor: option.hex }}
                                className={`w-5.5 h-5.5 rounded-full border border-ink/15 cursor-pointer transition-shadow ${
                                    selectedHexes.includes(option.hex)
                                        ? "ring-1 ring-ink ring-offset-2 ring-offset-bone"
                                        : "hover:ring-1 hover:ring-ink/40 hover:ring-offset-2 hover:ring-offset-bone"
                                }`}
                            />
                        ))}
                    </div>
                </FilterGroup>
            )}

            <FilterGroup
                title="Price"
                collapsed={priceCollapsed}
                onToggle={() => setPriceCollapsed((v) => !v)}
            >
                <div className="flex flex-col gap-3">
                    {PRICE_RANGES.map((range) => (
                        <label
                            key={range.key}
                            className={`flex items-center justify-between text-[13.5px] ${
                                priceCounts[range.key] > 0 ? "cursor-pointer" : "opacity-50"
                            }`}
                        >
                            <span className="flex items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 accent-wine"
                                    disabled={priceCounts[range.key] === 0}
                                    checked={selectedPrices.includes(range.key)}
                                    onChange={() => onTogglePrice(range.key)}
                                />
                                {range.label}
                            </span>
                            <span className="text-sage font-mono text-[11px]">
                                {priceCounts[range.key]}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterGroup>

            {filtersActive && (
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="mt-6 font-mono text-[11px] tracking-[0.05em] text-wine underline underline-offset-3 cursor-pointer"
                >
                    Clear all filters
                </button>
            )}
        </aside>
    );
}
