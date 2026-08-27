"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Panel from "./Panel";

// shape returned by GET /editorial
type EditorialContent = {
    imageUrl: string;
    imageAlt: string;
    eyebrow: string;
    quote: string;
    attribution: string;
};

const EMPTY_FORM: EditorialContent = {
    imageUrl: "",
    imageAlt: "",
    eyebrow: "",
    quote: "",
    attribution: "",
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

export default function EditorialManager() {
    const [form, setForm] = useState<EditorialContent>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        axios
            .get<EditorialContent>("http://localhost:2000/editorial", { timeout: 5000 })
            .then((res) => setForm(res.data))
            .catch(() => setNotice("Could not load editorial content."))
            .finally(() => setLoading(false));
    }, []);

    const set = (field: keyof EditorialContent) => (value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setNotice("");

        try {
            await axios.put("http://localhost:2000/editorial", form, {
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
        <Panel title="Editorial" link="View homepage" href="/">
            <div className="p-6">
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-6">
                    Homepage editorial band
                </p>

                {loading ? (
                    <p className="text-sm text-sage">Loading…</p>
                ) : (
                    <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 gap-x-6 gap-y-5">
                        <Field
                            label="Background image URL"
                            value={form.imageUrl}
                            onChange={set("imageUrl")}
                            placeholder="https://…"
                        />
                        <Field label="Image alt text" value={form.imageAlt} onChange={set("imageAlt")} />

                        <Field
                            label="Eyebrow"
                            value={form.eyebrow}
                            onChange={set("eyebrow")}
                            placeholder="The Journal"
                        />
                        <Field
                            label="Attribution"
                            value={form.attribution}
                            onChange={set("attribution")}
                            placeholder="— Studio notes, AW26 lookbook"
                        />

                        <div className="min-[1100px]:col-span-2">
                            <label className={labelClass}>Quote</label>
                            <textarea
                                value={form.quote}
                                onChange={(e) => set("quote")(e.target.value)}
                                rows={3}
                                className={`${inputClass} resize-none`}
                            />
                            <p className="text-[12px] text-sage mt-2">
                                Quotation marks are added automatically around the quote.
                            </p>
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
