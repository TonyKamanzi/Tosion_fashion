"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Panel from "./Panel";

type ArrivalRow = {
    _id: string;
    src: string;
    alt: string;
    tag: string;
    name: string;
    category: string;
    price: string;
    order: number;
    enabled: boolean;
};

type Draft = {
    name: string;
    src: string;
    alt: string;
    tag: string;
    category: string;
    price: string;
};

type SectionHeader = {
    title: string;
    description: string;
};

const EMPTY_NEW: Draft = { name: "", src: "", alt: "", tag: "", category: "", price: "" };

const labelClass = "block font-mono text-[10px] tracking-[0.14em] uppercase text-sage mb-2";
const inputClass =
    "w-full bg-bone-2 border border-ink/15 py-2.5 px-4 rounded-sm font-sans text-[13.5px] text-ink outline-none transition-colors focus:border-wine disabled:opacity-50";

const API = "http://localhost:2000/arrivals";

function draftOf(item: ArrivalRow): Draft {
    return {
        name: item.name,
        src: item.src,
        alt: item.alt,
        tag: item.tag,
        category: item.category,
        price: item.price,
    };
}

export default function ArrivalsManager() {
    const [items, setItems] = useState<ArrivalRow[]>([]);
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
            axios.get<ArrivalRow[]>(API, { timeout: 5000 }),
            axios.get<SectionHeader>("http://localhost:2000/arrivals/header", { timeout: 5000 }),
        ])
            .then(([itemsRes, headerRes]) => {
                setItems(itemsRes.data);
                setHeader(headerRes.data);
                setHeaderDraft({
                    title: headerRes.data.title,
                    description: headerRes.data.description,
                });
            })
            .catch(() => setNotice("Could not load new arrivals."))
            .finally(() => setLoading(false));
    }, []);

    const updateDraft = (id: string, field: keyof Draft, value: string) =>
        setDrafts((prev) => ({
            ...prev,
            [id]: { ...draftOf(items.find((i) => i._id === id)!), ...prev[id], [field]: value },
        }));

    const isDirty = (item: ArrivalRow) => {
        const draft = drafts[item._id];
        if (!draft) return false;
        return (
            draft.name !== item.name ||
            draft.src !== item.src ||
            draft.alt !== item.alt ||
            draft.tag !== item.tag ||
            draft.category !== item.category ||
            draft.price !== item.price
        );
    };

    const handleAdd = async () => {
        if (!newForm.name.trim() || adding) return;

        setAdding(true);
        setNotice("");

        try {
            const res = await axios.post<ArrivalRow>(API, newForm, { withCredentials: true });
            setItems((prev) => [...prev, res.data]);
            setNewForm(EMPTY_NEW);
            setNotice(`"${res.data.name}" added.`);
        } catch {
            setNotice("Add failed. Make sure you are signed in as an admin.");
        } finally {
            setAdding(false);
        }
    };

    const handleSave = async (item: ArrivalRow) => {
        const draft = drafts[item._id];
        if (!draft || !isDirty(item) || busyId) return;

        setBusyId(item._id);
        setNotice("");

        try {
            const res = await axios.put<ArrivalRow>(`${API}/${item._id}`, draft, {
                withCredentials: true,
            });
            setItems((prev) => prev.map((i) => (i._id === item._id ? res.data : i)));
            setDrafts((prev) => {
                const next = { ...prev };
                delete next[item._id];
                return next;
            });
            setNotice(`"${res.data.name}" saved.`);
        } catch {
            setNotice("Save failed.");
        } finally {
            setBusyId(null);
        }
    };

    const toggleEnabled = async (item: ArrivalRow) => {
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

    const removeArrival = async (item: ArrivalRow) => {
        if (busyId || !window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

        setBusyId(item._id);
        setNotice("");

        try {
            await axios.delete(`${API}/${item._id}`, { withCredentials: true });
            setItems((prev) => prev.filter((i) => i._id !== item._id));
            setNotice(`"${item.name}" deleted.`);
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
                "http://localhost:2000/arrivals/header",
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
        <Panel title="New Arrivals" link="View homepage">
            <div className="p-6">
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-1">
                    Storefront new arrivals
                </p>
                <p className="text-[12.5px] text-sage mb-6">
                    Add, edit, hide or reorder the products shown in the New Arrivals
                    section. Changes go live immediately.
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
                                            placeholder="New arrivals"
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
                                            placeholder="This week's edit…"
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
                                        <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-bone-2 border border-ink/10">
                                            {draft.src && (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={draft.src}
                                                    alt={item.name}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className={`block font-display font-medium text-lg leading-tight truncate ${item.enabled ? "" : "line-through"}`}>
                                                {item.name}
                                            </span>
                                            <span className="font-mono text-[11px] tracking-[0.08em] text-sage">
                                                #{item.order}
                                                {draft.category ? ` · ${draft.category}` : ""}
                                                {draft.price ? ` · ${draft.price}` : ""}
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
                                                aria-label={item.enabled ? "Hide product" : "Show product"}
                                                title={item.enabled ? "Hide product" : "Show product"}
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
                                                onClick={() => removeArrival(item)}
                                                disabled={busy}
                                                aria-label="Delete product"
                                                title="Delete product"
                                                className={`${iconBtn} border-ink/15 hover:border-wine hover:text-wine`}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* inline edit fields */}
                                    <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 gap-x-4 gap-y-3.5">
                                        <div>
                                            <label className={labelClass}>Name</label>
                                            <input
                                                type="text"
                                                value={draft.name}
                                                onChange={(e) => updateDraft(item._id, "name", e.target.value)}
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Category label</label>
                                            <input
                                                type="text"
                                                value={draft.category}
                                                onChange={(e) => updateDraft(item._id, "category", e.target.value)}
                                                placeholder="Outerwear"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Badge (optional)</label>
                                            <input
                                                type="text"
                                                value={draft.tag}
                                                onChange={(e) => updateDraft(item._id, "tag", e.target.value)}
                                                placeholder="NEW or −20%"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Price</label>
                                            <input
                                                type="text"
                                                value={draft.price}
                                                onChange={(e) => updateDraft(item._id, "price", e.target.value)}
                                                placeholder="$328"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="min-[1100px]:col-span-2">
                                            <label className={labelClass}>Image URL</label>
                                            <input
                                                type="text"
                                                value={draft.src}
                                                onChange={(e) => updateDraft(item._id, "src", e.target.value)}
                                                placeholder="https://…"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div className="min-[1100px]:col-span-2">
                                            <label className={labelClass}>Image alt text</label>
                                            <input
                                                type="text"
                                                value={draft.alt}
                                                onChange={(e) => updateDraft(item._id, "alt", e.target.value)}
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
                            Add a product
                        </p>
                        <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 gap-x-4 gap-y-3.5 max-w-3xl">
                            <div>
                                <label className={labelClass}>Name</label>
                                <input
                                    type="text"
                                    value={newForm.name}
                                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                    placeholder="Linen Shirt"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Category label</label>
                                <input
                                    type="text"
                                    value={newForm.category}
                                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                                    placeholder="Tops"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Badge (optional)</label>
                                <input
                                    type="text"
                                    value={newForm.tag}
                                    onChange={(e) => setNewForm({ ...newForm, tag: e.target.value })}
                                    placeholder="NEW or −20%"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Price</label>
                                <input
                                    type="text"
                                    value={newForm.price}
                                    onChange={(e) => setNewForm({ ...newForm, price: e.target.value })}
                                    placeholder="$98"
                                    className={inputClass}
                                />
                            </div>
                            <div className="min-[1100px]:col-span-2">
                                <label className={labelClass}>Image URL</label>
                                <input
                                    type="text"
                                    value={newForm.src}
                                    onChange={(e) => setNewForm({ ...newForm, src: e.target.value })}
                                    placeholder="https://…"
                                    className={inputClass}
                                />
                            </div>
                            <div className="min-[1100px]:col-span-2">
                                <label className={labelClass}>Image alt text</label>
                                <input
                                    type="text"
                                    value={newForm.alt}
                                    onChange={(e) => setNewForm({ ...newForm, alt: e.target.value })}
                                    placeholder="Model wearing a linen shirt"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!newForm.name.trim() || adding}
                            className="mt-5 bg-ink text-bone py-3 px-6 text-[13px] font-medium tracking-[0.02em] transition-colors hover:bg-wine disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {adding ? "Adding…" : "+ Add product"}
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
