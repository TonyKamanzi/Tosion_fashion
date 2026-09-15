"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function SettingsManager() {
    const [storeName, setStoreName] = useState("TOSION");
    const [storeEmail, setStoreEmail] = useState("hello@tosion.com");
    const [currency, setCurrency] = useState("USD");
    const [freeShippingThreshold, setFreeShippingThreshold] = useState("150");
    const [taxRate, setTaxRate] = useState("8");
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // simulate save
        await new Promise((r) => setTimeout(r, 800));
        setSaving(false);
        toast.success("Settings saved", { description: "Your changes have been applied." });
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display font-medium text-[clamp(28px,3vw,38px)] leading-[1.05] tracking-[-0.01em]">
                    Settings
                </h1>
                <p className="font-mono text-[11px] tracking-wider text-sage mt-2">
                    Store configuration
                </p>
            </div>

            <form onSubmit={(e) => void handleSave(e)} className="max-w-[640px] space-y-8">
                {/* store info */}
                <div className="bg-white border border-ink/15 p-6">
                    <h3 className="font-display font-medium text-[16px] mb-5">Store information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-sage mb-2">Store name</label>
                            <input
                                type="text"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                className="w-full border border-ink/14 bg-none py-3 px-3.5 font-sans text-[13.5px] text-ink outline-none focus:border-wine transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-sage mb-2">Contact email</label>
                            <input
                                type="email"
                                value={storeEmail}
                                onChange={(e) => setStoreEmail(e.target.value)}
                                className="w-full border border-ink/14 bg-none py-3 px-3.5 font-sans text-[13.5px] text-ink outline-none focus:border-wine transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-sage mb-2">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full border border-ink/14 bg-bone py-3 px-3.5 font-sans text-[13.5px] text-ink outline-none focus:border-wine transition-colors appearance-none cursor-pointer"
                            >
                                <option value="USD">USD — US Dollar</option>
                                <option value="EUR">EUR — Euro</option>
                                <option value="GBP">GBP — British Pound</option>
                                <option value="KES">KES — Kenyan Shilling</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* shipping */}
                <div className="bg-white border border-ink/15 p-6">
                    <h3 className="font-display font-medium text-[16px] mb-5">Shipping & tax</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-sage mb-2">Free shipping threshold ($)</label>
                            <input
                                type="number"
                                value={freeShippingThreshold}
                                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                                className="w-full border border-ink/14 bg-none py-3 px-3.5 font-sans text-[13.5px] text-ink outline-none focus:border-wine transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-sage mb-2">Tax rate (%)</label>
                            <input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                step="0.1"
                                className="w-full border border-ink/14 bg-none py-3 px-3.5 font-sans text-[13.5px] text-ink outline-none focus:border-wine transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="bg-ink text-bone px-8 py-3.5 font-mono text-[11px] tracking-[0.06em] uppercase border-none cursor-pointer hover:bg-wine transition-colors disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save settings"}
                </button>
            </form>
        </div>
    );
}
