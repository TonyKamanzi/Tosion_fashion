"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Panel from "./Panel";

type CategoryOption = {
    _id: string;
    label: string;
    slug: string;
    enabled: boolean;
};

// shape returned by GET /products/admin/list
type AdminProduct = {
    _id: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string;
    imageAltUrl: string;
    imageAlt: string;
    tag: string;
    sizes: string[];
    colors: { name: string; hex: string }[];
    category: CategoryOption | null;
    department: string;
    enabled: boolean;
};

type ProductDraft = {
    name: string;
    description: string;
    price: string;
    compareAtPrice: string;
    imageUrl: string;
    imageAltUrl: string;
    imageAlt: string;
    tag: string;
    sizesText: string; // comma-separated
    colors: { name: string; hex: string }[];
    categoryId: string;
    department: string;
    enabled: boolean;
};

const EMPTY_DRAFT: ProductDraft = {
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    imageUrl: "",
    imageAltUrl: "",
    imageAlt: "",
    tag: "",
    sizesText: "",
    colors: [],
    categoryId: "",
    department: "",
    enabled: true,
};

const API = "http://localhost:2000/products";
const CATEGORIES_API = "http://localhost:2000/categories";

const labelClass = "block font-mono text-[10px] tracking-[0.14em] uppercase text-sage mb-2";
const inputClass =
    "w-full bg-bone-2 border border-ink/15 py-2.5 px-4 rounded-sm font-sans text-[13.5px] text-ink outline-none transition-colors focus:border-wine disabled:opacity-50";
const iconBtn =
    "shrink-0 w-9 h-9 border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

function money(value: number) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function ProductsManager() {
    const [items, setItems] = useState<AdminProduct[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        Promise.all([
            axios.get<AdminProduct[]>(`${API}/admin/list`, {
                timeout: 6000,
                withCredentials: true,
            }),
            axios.get<CategoryOption[]>(CATEGORIES_API, { timeout: 6000 }),
        ])
            .then(([itemsRes, catsRes]) => {
                setItems(itemsRes.data);
                setCategories(catsRes.data.filter((c) => c.enabled));
            })
            .catch(() => setNotice("Could not load products — make sure you are signed in as an admin."))
            .finally(() => setLoading(false));
    }, []);

    const sortedItems = useMemo(
        () => [...items].sort((a, b) => Number(b.enabled) - Number(a.enabled)),
        [items]
    );

    const set = <K extends keyof ProductDraft>(field: K, value: ProductDraft[K]) =>
        setDraft((prev) => ({ ...prev, [field]: value }));

    const startAdd = () => {
        setEditingId(null);
        setDraft(EMPTY_DRAFT);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const startEdit = (item: AdminProduct) => {
        setEditingId(item._id);
        setDraft({
            name: item.name,
            description: item.description,
            price: String(item.price),
            compareAtPrice: item.compareAtPrice === null ? "" : String(item.compareAtPrice),
            imageUrl: item.imageUrl,
            imageAltUrl: item.imageAltUrl,
            imageAlt: item.imageAlt,
            tag: item.tag,
            sizesText: item.sizes.join(", "),
            colors: item.colors.map((c) => ({ ...c })),
            categoryId: item.category?._id ?? "",
            department: item.department ?? "",
            enabled: item.enabled,
        });
        setNotice("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const buildPayload = () => ({
        name: draft.name.trim(),
        description: draft.description.trim(),
        price: draft.price.trim(),
        compareAtPrice: draft.compareAtPrice.trim(),
        imageUrl: draft.imageUrl.trim(),
        imageAltUrl: draft.imageAltUrl.trim(),
        imageAlt: draft.imageAlt.trim(),
        tag: draft.tag.trim(),
        sizes: draft.sizesText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        colors: draft.colors.filter((c) => c.hex),
        category: draft.categoryId,
        department: draft.department,
        enabled: draft.enabled,
    });

    const validate = (): string | null => {
        if (!draft.name.trim()) return "Name is required.";
        if (draft.price.trim() === "" || Number.isNaN(Number(draft.price)))
            return "A valid price is required.";
        if (
            draft.compareAtPrice.trim() !== "" &&
            Number.isNaN(Number(draft.compareAtPrice))
        )
            return "Was-price must be a number.";
        if (!draft.categoryId) return "Pick a category.";
        if (!draft.department) return "Pick a line — Women or Men.";
        return null;
    };

    const handleSave = async () => {
        const problem = validate();
        if (problem || saving) {
            if (problem) setNotice(problem);
            return;
        }

        setSaving(true);
        setNotice("");

        try {
            const payload = buildPayload();
            const res = editingId
                ? await axios.put<AdminProduct>(`${API}/${editingId}`, payload, {
                      withCredentials: true,
                  })
                : await axios.post<AdminProduct>(API, payload, { withCredentials: true });

            setItems((prev) =>
                editingId
                    ? prev.map((i) => (i._id === editingId ? res.data : i))
                    : [res.data, ...prev]
            );
            setNotice(editingId ? `"${res.data.name}" updated.` : `"${res.data.name}" added.`);
            setEditingId(null);
            setDraft(EMPTY_DRAFT);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setNotice(`Save failed — ${error.response.data.message}`);
            } else {
                setNotice("Save failed — make sure you are signed in as an admin.");
            }
        } finally {
            setSaving(false);
        }
    };

    const toggleEnabled = async (item: AdminProduct) => {
        if (busyId) return;

        setBusyId(item._id);
        // optimistic flip, revert on failure
        setItems((prev) =>
            prev.map((i) => (i._id === item._id ? { ...i, enabled: !i.enabled } : i))
        );

        try {
            await axios.put(`${API}/${item._id}`, { enabled: !item.enabled }, {
                withCredentials: true,
            });
        } catch {
            setItems((prev) =>
                prev.map((i) => (i._id === item._id ? { ...i, enabled: item.enabled } : i))
            );
            setNotice("Toggle failed.");
        } finally {
            setBusyId(null);
        }
    };

    const removeProduct = async (item: AdminProduct) => {
        if (busyId || !window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

        setBusyId(item._id);
        setNotice("");

        try {
            await axios.delete(`${API}/${item._id}`, { withCredentials: true });
            setItems((prev) => prev.filter((i) => i._id !== item._id));
            if (editingId === item._id) startAdd();
            setNotice(`"${item.name}" deleted.`);
        } catch {
            setNotice("Delete failed.");
        } finally {
            setBusyId(null);
        }
    };

    const editingName = editingId
        ? items.find((i) => i._id === editingId)?.name ?? ""
        : "";

    return (
        <Panel title="Products" link="View shop">
            <div className="p-6">
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-1">
                    Catalogue
                </p>
                <p className="text-[12.5px] text-sage mb-6">
                    Add real pieces with prices, images, sizes and colours. Each product belongs
                    to one of your store categories and appears on its shop page immediately.
                </p>

                {/* ---------- add / edit form ---------- */}
                <div className="border border-ink/15 bg-white p-5 mb-8">
                    <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-4">
                        {editingId ? `Editing — ${editingName}` : "Add a product"}
                    </p>

                    <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 gap-x-4 gap-y-3.5">
                        <div className="min-[1100px]:col-span-2">
                            <label className={labelClass}>Name</label>
                            <input
                                type="text"
                                value={draft.name}
                                onChange={(e) => set("name", e.target.value)}
                                placeholder="Wool Overcoat"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Line</label>
                            <select
                                value={draft.department}
                                onChange={(e) => set("department", e.target.value)}
                                className={`${inputClass} cursor-pointer`}
                            >
                                <option value="">Women or men…</option>
                                <option value="women">Women</option>
                                <option value="men">Men</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Category</label>
                            <select
                                value={draft.categoryId}
                                onChange={(e) => set("categoryId", e.target.value)}
                                className={`${inputClass} cursor-pointer`}
                            >
                                <option value="">Choose a category…</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            {categories.length === 0 && !loading && (
                                <p className="text-[11px] text-wine mt-1.5">
                                    No categories yet — create one under Categories first.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                value={draft.description}
                                onChange={(e) => set("description", e.target.value)}
                                rows={2}
                                placeholder="Short selling line shown in list view…"
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-x-4">
                            <div>
                                <label className={labelClass}>Price ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={draft.price}
                                    onChange={(e) => set("price", e.target.value)}
                                    placeholder="328"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Was price ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={draft.compareAtPrice}
                                    onChange={(e) => set("compareAtPrice", e.target.value)}
                                    placeholder="410 — optional"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Main image URL</label>
                            <input
                                type="text"
                                value={draft.imageUrl}
                                onChange={(e) => set("imageUrl", e.target.value)}
                                placeholder="https://…"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Hover image URL</label>
                            <input
                                type="text"
                                value={draft.imageAltUrl}
                                onChange={(e) => set("imageAltUrl", e.target.value)}
                                placeholder="https://… — optional alternate view"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Image alt text</label>
                            <input
                                type="text"
                                value={draft.imageAlt}
                                onChange={(e) => set("imageAlt", e.target.value)}
                                placeholder="Model wearing a wool overcoat"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Badge tag</label>
                            <input
                                type="text"
                                value={draft.tag}
                                onChange={(e) => set("tag", e.target.value)}
                                placeholder='NEW or −20% — leave empty for none'
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Sizes (comma separated)</label>
                            <input
                                type="text"
                                value={draft.sizesText}
                                onChange={(e) => set("sizesText", e.target.value)}
                                placeholder="XS, S, M, L, XL"
                                className={inputClass}
                            />
                        </div>

                        {/* colours */}
                        <div>
                            <label className={labelClass}>Colours</label>
                            <div className="flex flex-col gap-2">
                                {draft.colors.map((color, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="color"
                                            value={/^#[0-9a-fA-F]{6}$/.test(color.hex) ? color.hex : "#191714"}
                                            onChange={(e) =>
                                                set(
                                                    "colors",
                                                    draft.colors.map((c, i) =>
                                                        i === index ? { ...c, hex: e.target.value } : c
                                                    )
                                                )
                                            }
                                            aria-label={`Colour ${index + 1} swatch`}
                                            className="h-10 w-10 shrink-0 border border-ink/15 bg-transparent cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={color.name}
                                            onChange={(e) =>
                                                set(
                                                    "colors",
                                                    draft.colors.map((c, i) =>
                                                        i === index ? { ...c, name: e.target.value } : c
                                                    )
                                                )
                                            }
                                            placeholder="Ink"
                                            className={`${inputClass} flex-1`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                set(
                                                    "colors",
                                                    draft.colors.filter((_, i) => i !== index)
                                                )
                                            }
                                            aria-label="Remove colour"
                                            className={`${iconBtn} border-ink/15 hover:border-wine hover:text-wine`}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => set("colors", [...draft.colors, { name: "", hex: "#191714" }])}
                                    className="self-start font-mono text-[11px] tracking-[0.05em] uppercase text-wine underline underline-offset-3 cursor-pointer mt-0.5"
                                >
                                    + Add colour
                                </button>
                            </div>
                        </div>

                        {/* visibility */}
                        <label className="flex items-center gap-2.5 text-[13.5px] cursor-pointer min-[1100px]:col-span-2 w-fit">
                            <input
                                type="checkbox"
                                checked={draft.enabled}
                                onChange={(e) => set("enabled", e.target.checked)}
                                className="w-3.5 h-3.5 accent-wine"
                            />
                            Visible on the storefront
                        </label>
                    </div>

                    <div className="mt-5 pt-5 border-t border-ink/15 flex items-center gap-4 flex-wrap">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-ink text-bone py-3 px-6 text-[13px] font-medium tracking-[0.02em] transition-colors hover:bg-wine disabled:opacity-60 cursor-pointer"
                        >
                            {saving ? "Saving…" : editingId ? "Save changes" : "+ Add product"}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={startAdd}
                                className="font-mono text-[11px] tracking-[0.08em] uppercase text-sage hover:text-ink transition-colors cursor-pointer"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                </div>

                {/* ---------- product list ---------- */}
                {!loading && items.length === 0 && (
                    <div className="border border-dashed border-ink/20 bg-bone-2/50 py-14 text-center">
                        <p className="font-display italic text-xl text-sage mb-2">
                            No products in the catalogue yet.
                        </p>
                        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-sage/80">
                            Add your first piece with the form above.
                        </p>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {sortedItems.map((item) => {
                            const busy = busyId === item._id;
                            return (
                                <div
                                    key={item._id}
                                    className={`border p-4 flex items-start gap-4 ${
                                        item.enabled ? "border-ink/15 bg-white" : "border-wine/25 bg-bone/30"
                                    }`}
                                >
                                    {/* thumbnail */}
                                    <div className="relative w-12 h-16 shrink-0 overflow-hidden bg-bone-2 border border-ink/10">
                                        {item.imageUrl && (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={item.imageUrl}
                                                alt={item.imageAlt || item.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <span className="block font-medium text-[14px] truncate">
                                            {item.name}
                                            {!item.enabled && (
                                                <span className="ml-2 font-mono text-[10px] tracking-[0.1em] uppercase text-wine">
                                                    hidden
                                                </span>
                                            )}
                                        </span>
                                        <span className="block font-mono text-[11px] tracking-[0.06em] text-sage mt-1">
                                            {item.department
                                                ? item.department === "women"
                                                    ? "Women"
                                                    : "Men"
                                                : "— no line"}
                                            {" · "}
                                            {item.category?.label ?? "— no category"} ·{" "}
                                            {money(item.price)}
                                            {item.compareAtPrice !== null &&
                                                ` · was ${money(item.compareAtPrice)}`}
                                            {item.sizes.length > 0 && ` · ${item.sizes.join("/")}`}
                                            {item.colors.length > 0 &&
                                                ` · ${item.colors.length} colour${item.colors.length > 1 ? "s" : ""}`}
                                        </span>
                                    </div>

                                    <div className="flex gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(item)}
                                            disabled={busy}
                                            aria-label={`Edit ${item.name}`}
                                            title="Edit"
                                            className={`${iconBtn} border-ink/15 hover:border-ink`}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></svg>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleEnabled(item)}
                                            disabled={busy}
                                            aria-label={item.enabled ? "Hide from storefront" : "Show on storefront"}
                                            title={item.enabled ? "Hide from storefront" : "Show on storefront"}
                                            className={`${iconBtn} ${
                                                item.enabled
                                                    ? "border-ink/15 hover:border-ink"
                                                    : "border-wine/30 text-wine"
                                            }`}
                                        >
                                            {item.enabled ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(item)}
                                            disabled={busy}
                                            aria-label={`Delete ${item.name}`}
                                            title="Delete"
                                            className={`${iconBtn} border-ink/15 hover:border-wine hover:text-wine`}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {(loading || notice) && (
                    <div className="mt-5 space-y-2">
                        {loading && <p className="text-sm text-sage">Loading…</p>}
                        {notice && (
                            <p className="text-[13px] text-sage" role="status">
                                {notice}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Panel>
    );
}
