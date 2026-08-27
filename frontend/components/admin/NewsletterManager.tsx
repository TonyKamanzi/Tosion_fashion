"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Panel from "./Panel";

// shape returned by GET /newsletter
type NewsletterContent = {
    title: string;
    placeholder: string;
    buttonLabel: string;
    subscribedLabel: string;
};

const EMPTY_FORM: NewsletterContent = {
    title: "",
    placeholder: "",
    buttonLabel: "",
    subscribedLabel: "",
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

export default function NewsletterManager() {
    const [form, setForm] = useState<NewsletterContent>(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");

    useEffect(() => {
        axios
            .get<NewsletterContent>("http://localhost:2000/newsletter", { timeout: 5000 })
            .then((res) => setForm(res.data))
            .catch(() => setNotice("Could not load newsletter content."))
            .finally(() => setLoading(false));
    }, []);

    const set = (field: keyof NewsletterContent) => (value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setNotice("");

        try {
            await axios.put("http://localhost:2000/newsletter", form, {
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
        <Panel title="Newsletter" link="View homepage" href="/">
            <div className="p-6">
                <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-6">
                    Homepage newsletter band
                </p>

                {loading ? (
                    <p className="text-sm text-sage">Loading…</p>
                ) : (
                    <div className="grid grid-cols-1 min-[1100px]:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="min-[1100px]:col-span-2">
                            <Field
                                label="Heading"
                                value={form.title}
                                onChange={set("title")}
                                placeholder="Get first access to new drops."
                            />
                        </div>

                        <Field
                            label="Input placeholder"
                            value={form.placeholder}
                            onChange={set("placeholder")}
                            placeholder="Your email address"
                        />
                        <Field
                            label="Button label"
                            value={form.buttonLabel}
                            onChange={set("buttonLabel")}
                            placeholder="Subscribe →"
                        />

                        <div className="min-[1100px]:col-span-2">
                            <Field
                                label="Confirmation after subscribing"
                                value={form.subscribedLabel}
                                onChange={set("subscribedLabel")}
                                placeholder="Subscribed ✓"
                            />
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
