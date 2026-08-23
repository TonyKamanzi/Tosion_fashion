"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Panel from "./Panel";

type MarqueeItem = {
    _id?: string;
    text: string;
    enabled: boolean;
};

// shape returned by GET /hero
type HeroContent = {
    imageUrl: string;
    imageAlt: string;
    badge: string;
    eyebrow: string;
    headlinePre: string;
    headlineItalic: string;
    headlinePost: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    marqueeItems: MarqueeItem[];
};

const EMPTY_FORM: HeroContent = {
    imageUrl: "",
    imageAlt: "",
    badge: "",
    eyebrow: "",
    headlinePre: "",
    headlineItalic: "",
    headlinePost: "",
    description: "",
    ctaLabel: "",
    ctaHref: "",
    marqueeItems: [],
};

const labelClass = "block font-mono text-[10px] tracking-[0.14em] uppercase text-sage mb-2";
const inputClass =
    "w-full bg-bone-2 border border-ink/15 py-2.5 px-4 rounded-sm font-sans text-[13.5px] text-ink outline-none transition-colors focus:border-wine";

function Field({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={inputClass}
            />
        </div>
    );
}

export default function HeroManager() {
    const [form, setForm] = useState<HeroContent>(EMPTY_FORM);
    const [newMarqueeText, setNewMarqueeText] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        axios
            .get<HeroContent>("http://localhost:2000/hero", { timeout: 5000 })
            .then((res) =>
                setForm({
                    ...res.data,
                    marqueeItems: res.data.marqueeItems.map((item) => ({ ...item })),
                })
            )
            .catch(() => setNotice("Could not load hero content."))
            .finally(() => setLoading(false));
    }, []);

    const set = (field: keyof Omit<HeroContent, "marqueeItems">) => (value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const addMarqueeItem = () => {
        const text = newMarqueeText.trim();
        if (!text) return;
        setForm((prev) => ({
            ...prev,
            marqueeItems: [...prev.marqueeItems, { text, enabled: true }],
        }));
        setNewMarqueeText("");
    };

    const toggleMarqueeItem = (index: number) => {
        setForm((prev) => ({
            ...prev,
            marqueeItems: prev.marqueeItems.map((item, i) =>
                i === index ? { ...item, enabled: !item.enabled } : item
            ),
        }));
    };

    const removeMarqueeItem = (index: number) => {
        setForm((prev) => ({
            ...prev,
            marqueeItems: prev.marqueeItems.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setNotice("");

        try {
            await axios.put("http://localhost:2000/hero", form, {
                withCredentials: true,
            });
            setNotice("Saved. The homepage now shows this content.");
        } catch {
            setNotice("Save failed. Make sure you are signed in as an admin.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Panel title="Hero & Adverts" link="View homepage">
            <div className="p-6">
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-6">
                    Homepage hero section
                </p>

                {loading ? (
                    <p className="text-sm text-sage">Loading…</p>
                ) : (
                    <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 gap-x-6 gap-y-5">
                        <Field
                            label="Image URL"
                            value={form.imageUrl}
                            onChange={set("imageUrl")}
                            placeholder="https://…"
                        />
                        <Field label="Image alt text" value={form.imageAlt} onChange={set("imageAlt")} />

                        <Field
                            label="Stock badge"
                            value={form.badge}
                            onChange={set("badge")}
                            placeholder="In stock — ships in 48h"
                        />
                        <Field
                            label="Eyebrow"
                            value={form.eyebrow}
                            onChange={set("eyebrow")}
                            placeholder="Autumn / Winter 2026"
                        />

                        <div>
                            <label className={labelClass}>Headline</label>
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                <input
                                    type="text"
                                    value={form.headlinePre}
                                    onChange={(e) => set("headlinePre")(e.target.value)}
                                    className={`${inputClass} w-auto`}
                                    placeholder="Cut for"
                                />
                                <em className="font-display italic text-wine text-lg whitespace-nowrap">
                                    word
                                </em>
                                <input
                                    type="text"
                                    value={form.headlinePost}
                                    onChange={(e) => set("headlinePost")(e.target.value)}
                                    className={`${inputClass} w-auto`}
                                    placeholder="confidence."
                                />
                            </div>
                        </div>
                        <Field
                            label="Headline italic word"
                            value={form.headlineItalic}
                            onChange={set("headlineItalic")}
                            placeholder="quiet"
                        />

                        <div className="min-[1100px]:col-span-2">
                            <label className={labelClass}>Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => set("description")(e.target.value)}
                                rows={3}
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <Field label="Button label" value={form.ctaLabel} onChange={set("ctaLabel")} />
                        <Field
                            label="Button link"
                            value={form.ctaHref}
                            onChange={set("ctaHref")}
                            placeholder="#collection"
                        />

                        {/* marquee / advert strip */}
                        <div className="min-[1100px]:col-span-2 mt-4 pt-6 border-t border-ink/15">
                            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-1">
                                Advert strip (scrolling marquee)
                            </p>
                            <p className="text-[12.5px] text-sage mb-4">
                                Toggle the eye to hide or unhide an item; hidden items stay saved.
                            </p>

                            <div className="flex flex-col gap-2.5 mb-4">
                                {form.marqueeItems.map((item, index) => (
                                    <div key={item._id ?? `${item.text}-${index}`} className="flex items-center gap-2.5">
                                        <input
                                            type="text"
                                            value={item.text}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    marqueeItems: prev.marqueeItems.map((m, i) =>
                                                        i === index ? { ...m, text: e.target.value } : m
                                                    ),
                                                }))
                                            }
                                            className={`${inputClass} ${item.enabled ? "" : "opacity-50 line-through"}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleMarqueeItem(index)}
                                            aria-label={item.enabled ? "Hide item" : "Show item"}
                                            title={item.enabled ? "Hide item" : "Show item"}
                                            className={`shrink-0 w-[38px] h-[38px] border flex items-center justify-center transition-colors cursor-pointer ${
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
                                            onClick={() => removeMarqueeItem(index)}
                                            aria-label="Remove item"
                                            title="Remove item"
                                            className="shrink-0 w-[38px] h-[38px] border border-ink/15 flex items-center justify-center transition-colors hover:border-wine hover:text-wine cursor-pointer"
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2.5 max-w-md">
                                <input
                                    type="text"
                                    value={newMarqueeText}
                                    placeholder="New advert item…"
                                    onChange={(e) => setNewMarqueeText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addMarqueeItem()}
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={addMarqueeItem}
                                    className="shrink-0 bg-bone-2 border border-ink/15 px-5 text-[13px] font-medium tracking-[0.02em] transition-colors hover:border-ink cursor-pointer"
                                >
                                    + Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && (
                    <div className="mt-8 pt-6 border-t border-ink/15 flex items-center gap-5">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-ink text-bone py-3 px-6 text-[13px] font-medium tracking-[0.02em] transition-colors hover:bg-wine disabled:opacity-60 cursor-pointer"
                        >
                            {saving ? "Saving…" : "Save changes"}
                        </button>
                        {notice && <span className="text-[13px] text-sage">{notice}</span>}
                    </div>
                )}
            </div>
        </Panel>
    );
}
