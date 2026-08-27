"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Panel from "./Panel";
import { API_URL } from "@/lib/api";

type CategoryRow = {
    _id: string;
    label: string;
    slug: string;
    eyebrow: string;
    description?: string;
    imageUrl: string;
    imageAlt: string;
    order: number;
    enabled: boolean;
};

type Draft = {
    label: string;
    eyebrow: string;
    description: string;
    imageUrl: string;
    imageAlt: string;
};

type SectionHeader = {
    title: string;
    description: string;
};

const EMPTY_NEW: Draft = { label: "", eyebrow: "", description: "", imageUrl: "", imageAlt: "" };

const labelClass = "block font-mono text-[10px] tracking-[0.14em] uppercase text-sage mb-2";
const inputClass =
    "w-full bg-bone-2 border border-ink/15 py-2.5 px-4 rounded-sm font-sans text-[13.5px] text-ink outline-none transition-colors focus:border-wine disabled:opacity-50";

const API = `${API_URL}/categories`;

function draftOf(item: CategoryRow): Draft {
    return {
        label: item.label,
        eyebrow: item.eyebrow,
        description: item.description ?? "",
        imageUrl: item.imageUrl,
        imageAlt: item.imageAlt,
    };
}

export default function CategoriesManager() {
    const [items, setItems] = useState<CategoryRow[]>([]);
    const [header, setHeader] = useState<SectionHeader | null>(null);
    const [headerDraft, setHeaderDraft] = useState<SectionHeader>({ title: "", description: "" });
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState("");
    const [drafts, setDrafts] = useState<Record<string, Draft>>({});
    const [busyId, setBusyId] = useState<string | null>(null);
    const [savingHeader, setSavingHeader] = useState(false);
    const [newForm, setNewForm] = useState<Draft>(EMPTY_NEW);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        Promise.all([
            axios.get<CategoryRow[]>(API, { timeout: 5000 }),
            axios.get<SectionHeader>(`${API_URL}/categories/header`, { timeout: 5000 }),
        ])
            .then(([itemsRes, headerRes]) => {
                setItems(itemsRes.data);
                setHeader(headerRes.data);
                setHeaderDraft({
                    title: headerRes.data.title,
                    description: headerRes.data.description,
                });
            })
            .catch(() => setNotice("Could not load categories."))
            .finally(() => setLoading(false));
    }, []);

    const updateDraft = (id: string, field: keyof Draft, value: string) =>
        setDrafts((prev) => ({
            ...prev,
            [id]: { ...draftOf(items.find((i) => i._id === id)!), ...prev[id], [field]: value },
        }));

    const isDirty = (item: CategoryRow) => {
        const draft = drafts[item._id];
        if (!draft) return false;
        return (
            draft.label !== item.label ||
            draft.eyebrow !== item.eyebrow ||
            draft.description !== (item.description ?? "") ||
            draft.imageUrl !== item.imageUrl ||
            draft.imageAlt !== item.imageAlt
        );
    };

    const handleAdd = async () => {
        if (!newForm.label.trim() || adding) return;

        setAdding(true);
        setNotice("");

        try {
            const res = await axios.post<CategoryRow>(API, newForm, { withCredentials: true });
            setItems((prev) => [...prev, res.data]);
            setNewForm(EMPTY_NEW);
            setNotice(`"${res.data.label}" added.`);
        } catch {
            setNotice("Add failed — check the label is unique and you are signed in as an admin.");
        } finally {
            setAdding(false);
        }
    };

    const handleSave = async (item: CategoryRow) => {
        const draft = drafts[item._id];
        if (!draft || !isDirty(item) || busyId) return;

        setBusyId(item._id);
        setNotice("");

        try {
            const res = await axios.put<CategoryRow>(`${API}/${item._id}`, draft, {
                withCredentials: true,
            });
            setItems((prev) => prev.map((i) => (i._id === item._id ? res.data : i)));
            setDrafts((prev) => {
                const next = { ...prev };
                delete next[item._id];
                return next;
            });
            setNotice(`"${res.data.label}" saved.`);
        } catch {
            setNotice("Save failed — the label may collide with another category.");
        } finally {
            setBusyId(null);
        }
    };

    const toggleEnabled = async (item: CategoryRow) => {
        if (busyId) return;

        // optimistic flip, revert on failure
        setBusyId(item._id);
        setItems((prev) =>
            prev.map((i) => (i._id === item._id ? { ...i, enabled: !i.enabled } : i))
        );

        try {
            await axios.put(
                `${API}/${item._id}`,
                { enabled: !item.enabled },
                { withCredentials: true }
            );
        } catch {
            setItems((prev) =>
                prev.map((i) => (i._id === item._id ? { ...i, enabled: item.enabled } : i))
            );
            setNotice("Toggle failed.");
        } finally {
            setBusyId(null);
        }
    };

    const removeCategory = async (item: CategoryRow) => {
        if (busyId || !window.confirm(`Delete "${item.label}"? This cannot be undone.`)) return;

        setBusyId(item._id);
        setNotice("");

        try {
            await axios.delete(`${API}/${item._id}`, { withCredentials: true });
            setItems((prev) => prev.filter((i) => i._id !== item._id));
            setNotice(`"${item.label}" deleted.`);
        } catch {
            setNotice("Delete failed.");
        } finally {
            setBusyId(null);
        }
    };

    // swap order values with the neighbour and persist both rows instantly
    const move = async (index: number, direction: -1 | 1) => {
        const other = index + direction;
        if (other < 0 || other >= items.length || busyId) return;

        const a = items[index];
        const b = items[other];

        setBusyId(a._id);
        setNotice("");
        setItems((prev) =>
            prev.map((i) =>
                i._id === a._id ? { ...i, order: b.order } : i._id === b._id ? { ...i, order: a.order } : i
            )
        );

        try {
            await Promise.all([
                axios.put(`${API}/${a._id}`, { order: b.order }, { withCredentials: true }),
                axios.put(`${API}/${b._id}`, { order: a.order }, { withCredentials: true }),
            ]);
        } catch {
            setItems((prev) =>
                prev.map((i) =>
                    i._id === a._id ? { ...i, order: a.order } : i._id === b._id ? { ...i, order: b.order } : i
                )
            );
            setNotice("Reorder failed.");
        } finally {
            setBusyId(null);
        }
    };

    const headerDirty =
        header !== null &&
        (headerDraft.title !== header.title ||
            headerDraft.description !== header.description);

    const handleSaveHeader = async () => {
        if (!headerDirty || savingHeader) return;

        setSavingHeader(true);
        setNotice("");

        try {
            const res = await axios.put<SectionHeader>(
                `${API_URL}/categories/header`,
                headerDraft,
                { withCredentials: true }
            );
            setHeader(res.data);
            setNotice("Section header saved.");
        } catch {
            setNotice("Header save failed. Make sure you are signed in as an admin.");
        } finally {
            setSavingHeader(false);
        }
    };

    const iconBtn =
        "shrink-0 w-9 h-9 border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

    return (
        <Panel title="Categories" link="View homepage" href="/">
            <div className="p-6">
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-1">
                    Storefront categories
                </p>
                <p className="text-[12.5px] text-sage mb-6">
                    Add, edit, hide or reorder the collections shown on the homepage.
                    Changes go live immediately.
                </p>

                {loading ? (
                    <p className="text-sm text-sage">Loading…</p>
                ) : (
                    <div className="flex flex-col gap-4 mb-8">
                        {/* section header editor */}
                        {header && (
                            <div className="border border-ink/15 bg-white p-5">
                                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-4">
                                    Section header
                                </p>
                                <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 gap-x-4 gap-y-3.5">
                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input
                                            type="text"
                                            value={headerDraft.title}
                                            onChange={(e) =>
                                                setHeaderDraft({ ...headerDraft, title: e.target.value })
                                            }
                                            placeholder="Shop by category"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Blurb</label>
                                        <input
                                            type="text"
                                            value={headerDraft.description}
                                            onChange={(e) =>
                                                setHeaderDraft({
                                                    ...headerDraft,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Three edits, one wardrobe…"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleSaveHeader}
                                        disabled={!headerDirty || savingHeader}
                                        className="bg-ink text-bone py-2.5 px-5 text-[13px] font-medium tracking-[0.02em] transition-colors hover:bg-wine disabled:bg-ink/20 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {savingHeader
                                            ? "Saving…"
                                            : headerDirty
                                                ? "Save header"
                                                : "Saved"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {items.map((item, index) => {
                            const draft = drafts[item._id] ?? draftOf(item);
                            const dirty = isDirty(item);
                            const busy = busyId === item._id;

                            return (
                                <div
                                    key={item._id}
                                    className={`border p-5 ${
                                        item.enabled ? "border-ink/15 bg-white" : "border-wine/25 bg-bone/30"
                                    }`}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        {/* thumbnail preview */}
                                        <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-bone-2 border border-ink/10 grayscale-20">
                                            {draft.imageUrl && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={draft.imageUrl}
                                                    alt={item.label}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="block font-display font-medium text-lg leading-tight truncate">
                                                {item.label}
                                            </span>
                                            <span className="font-mono text-[11px] tracking-[0.08em] text-sage break-all">
                                                /shop/{item.slug} · #{item.order}
                                            </span>
                                        </div>

                                        {/* row actions */}
                                        <div className="flex gap-1.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => move(index, -1)}
                                                disabled={index === 0 || busy}
                                                aria-label="Move up"
                                                title="Move up"
                                                className={`${iconBtn} border-ink/15 hover:border-ink`}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="18 15 12 9 6 15" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => move(index, 1)}
                                                disabled={index === items.length - 1 || busy}
                                                aria-label="Move down"
                                                title="Move down"
                                                className={`${iconBtn} border-ink/15 hover:border-ink`}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="6 9 12 15 18 9" /></svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleEnabled(item)}
                                                disabled={busy}
                                                aria-label={item.enabled ? "Hide category" : "Show category"}
                                                title={item.enabled ? "Hide category" : "Show category"}
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
                                                onClick={() => removeCategory(item)}
                                                disabled={busy}
                                                aria-label="Delete category"
                                                title="Delete category"
                                                className={`${iconBtn} border-ink/15 hover:border-wine hover:text-wine`}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* inline edit fields */}
                                    <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 gap-x-4 gap-y-3.5">
                                        <div>
                                            <label className={labelClass}>Label</label>
                                            <input
                                                type="text"
                                                value={draft.label}
                                                onChange={(e) => updateDraft(item._id, "label", e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Eyebrow</label>
                                            <input
                                                type="text"
                                                value={draft.eyebrow}
                                                onChange={(e) => updateDraft(item._id, "eyebrow", e.target.value)}
                                                placeholder="01 — Layers"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="min-[1100px]:col-span-2">
                                            <label className={labelClass}>Description</label>
                                            <textarea
                                                value={draft.description}
                                                onChange={(e) => updateDraft(item._id, "description", e.target.value)}
                                                rows={2}
                                                placeholder="Intro copy shown on the shop page for this category…"
                                                className={`${inputClass} resize-none`}
                                            />
                                        </div>
                                        <div className="min-[1100px]:col-span-2">
                                            <label className={labelClass}>Image URL</label>
                                            <input
                                                type="text"
                                                value={draft.imageUrl}
                                                onChange={(e) => updateDraft(item._id, "imageUrl", e.target.value)}
                                                placeholder="https://…"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="min-[1100px]:col-span-2">
                                            <label className={labelClass}>Image alt text</label>
                                            <input
                                                type="text"
                                                value={draft.imageAlt}
                                                onChange={(e) => updateDraft(item._id, "imageAlt", e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleSave(item)}
                                            disabled={!dirty || busy}
                                            className="bg-ink text-bone py-2.5 px-5 text-[13px] font-medium tracking-[0.02em] transition-colors hover:bg-wine disabled:bg-ink/20 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {busy ? "Working…" : dirty ? "Save changes" : "Saved"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && (
                    <div className="pt-6 border-t border-ink/15">
                        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-4">
                            Add a category
                        </p>
                        <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 gap-x-4 gap-y-3.5 max-w-3xl">
                            <div>
                                <label className={labelClass}>Label</label>
                                <input
                                    type="text"
                                    value={newForm.label}
                                    onChange={(e) => setNewForm({ ...newForm, label: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                    placeholder="Winter Knits"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Eyebrow</label>
                                <input
                                    type="text"
                                    value={newForm.eyebrow}
                                    onChange={(e) => setNewForm({ ...newForm, eyebrow: e.target.value })}
                                    placeholder="07 — Cold Days"
                                    className={inputClass}
                                />
                            </div>
                            <div className="min-[1100px]:col-span-2">
                                <label className={labelClass}>Description</label>
                                <textarea
                                    value={newForm.description}
                                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                                    rows={2}
                                    placeholder="Intro copy shown on the shop page for this category…"
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                            <div className="min-[1100px]:col-span-2">
                                <label className={labelClass}>Image URL</label>
                                <input
                                    type="text"
                                    value={newForm.imageUrl}
                                    onChange={(e) => setNewForm({ ...newForm, imageUrl: e.target.value })}
                                    placeholder="https://…"
                                    className={inputClass}
                                />
                            </div>
                            <div className="min-[1100px]:col-span-2">
                                <label className={labelClass}>Image alt text</label>
                                <input
                                    type="text"
                                    value={newForm.imageAlt}
                                    onChange={(e) => setNewForm({ ...newForm, imageAlt: e.target.value })}
                                    placeholder="Woman wearing a knit sweater"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!newForm.label.trim() || adding}
                            className="mt-5 bg-ink text-bone py-3 px-6 text-[13px] font-medium tracking-[0.02em] transition-colors hover:bg-wine disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {adding ? "Adding…" : "+ Add category"}
                        </button>
                    </div>
                )}

                {notice && (
                    <p className="mt-5 text-[13px] text-sage" role="status">
                        {notice}
                    </p>
                )}
            </div>
        </Panel>
    );
}
