"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";

type PromoDoc = {
    _id: string;
    code: string;
    type: "percent" | "fixed";
    value: number;
    minOrder: number;
    maxUses: number;
    usedCount: number;
    enabled: boolean;
    createdAt: string;
};

const EMPTY_FORM = {
    code: "",
    type: "percent" as "percent" | "fixed",
    value: "",
    minOrder: "",
    maxUses: "",
    enabled: true,
};

const labelClass = "block font-mono text-[10px] tracking-[0.14em] uppercase text-sage mb-2";
const inputClass =
    "w-full bg-bone-2 border border-ink/15 py-2.5 px-4 rounded-sm font-sans text-[13.5px] text-ink outline-none transition-colors focus:border-wine";

export default function DiscountManager() {
    const [items, setItems] = useState<PromoDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [notice, setNotice] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchItems = useCallback(async () => {
        try {
            const { data } = await axios.get<{ items: PromoDoc[] }>(`${API_URL}/promos`);
            setItems(data.items);
        } catch {
            setNotice("Failed to load promo codes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void (async () => { await fetchItems(); })();
    }, [fetchItems]);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!form.code.trim() || !form.value) return;
        setSubmitting(true);
        setNotice("");
        try {
            const payload = {
                code: form.code.trim(),
                type: form.type,
                value: Number(form.value),
                minOrder: form.minOrder ? Number(form.minOrder) : 0,
                maxUses: form.maxUses ? Number(form.maxUses) : 0,
                enabled: form.enabled,
            };
            if (editingId) {
                await axios.put(`${API_URL}/promos/${editingId}`, payload, { withCredentials: true });
                setNotice("Promo code updated.");
            } else {
                await axios.post(`${API_URL}/promos`, payload, { withCredentials: true });
                setNotice("Promo code created.");
            }
            resetForm();
            void fetchItems();
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err) ? err.response?.data?.message : "Save failed";
            setNotice(msg || "Save failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item: PromoDoc) => {
        setEditingId(item._id);
        setForm({
            code: item.code,
            type: item.type,
            value: String(item.value),
            minOrder: item.minOrder ? String(item.minOrder) : "",
            maxUses: item.maxUses ? String(item.maxUses) : "",
            enabled: item.enabled,
        });
        setNotice("");
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this promo code?")) return;
        try {
            await axios.delete(`${API_URL}/promos/${id}`, { withCredentials: true });
            setNotice("Promo code deleted.");
            void fetchItems();
        } catch {
            setNotice("Delete failed.");
        }
    };

    const handleToggle = async (item: PromoDoc) => {
        try {
            await axios.put(
                `${API_URL}/promos/${item._id}`,
                { enabled: !item.enabled },
                { withCredentials: true }
            );
            void fetchItems();
        } catch {
            setNotice("Failed to toggle promo code.");
        }
    };

    if (loading) {
        return (
            <div className="p-8 font-mono text-[12px] text-sage">
                Loading promo codes…
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[760px]">
            <h1 className="font-display font-medium text-[26px] mb-1">Discounts</h1>
            <p className="font-mono text-[11px] text-sage mb-8">
                Create and manage promo codes for your store.
            </p>

            {notice && (
                <div className="mb-6 py-3 px-4 bg-wine/5 border border-wine/20 font-mono text-[12px] text-wine">
                    {notice}
                </div>
            )}

            {/* form */}
            <div className="bg-bone-2 border border-ink/10 p-6 rounded-sm mb-8">
                <h2 className="font-display font-medium text-[16px] mb-4">
                    {editingId ? "Edit promo code" : "New promo code"}
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className={labelClass}>Code</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                            placeholder="e.g. SUMMER20"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "percent" | "fixed" }))}
                            className={`${inputClass} appearance-none cursor-pointer`}
                        >
                            <option value="percent">Percent (%)</option>
                            <option value="fixed">Fixed amount ($)</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className={labelClass}>{form.type === "percent" ? "Percent off" : "Amount off ($)"}</label>
                        <input
                            type="number"
                            value={form.value}
                            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                            placeholder={form.type === "percent" ? "10" : "25"}
                            min="0"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Min order ($)</label>
                        <input
                            type="number"
                            value={form.minOrder}
                            onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                            placeholder="0 = none"
                            min="0"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Max uses</label>
                        <input
                            type="number"
                            value={form.maxUses}
                            onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                            placeholder="0 = unlimited"
                            min="0"
                            className={inputClass}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.enabled}
                            onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                            className="accent-wine"
                        />
                        <span className="font-mono text-[11px] text-sage">Enabled</span>
                    </label>
                </div>
                <div className="flex gap-3 mt-5">
                    <button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={submitting || !form.code.trim() || !form.value}
                        className="bg-ink text-bone px-6 py-2.5 font-mono text-[11px] tracking-[0.06em] uppercase rounded-sm cursor-pointer hover:bg-wine disabled:opacity-40 transition-colors"
                    >
                        {submitting ? "Saving…" : editingId ? "Update" : "Create"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sage font-mono text-[11px] tracking-[0.06em] underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-ink"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* list */}
            <div className="border border-ink/10 rounded-sm overflow-hidden">
                <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.6fr_0.5fr_1fr] gap-3 bg-ink text-bone px-5 py-3 font-mono text-[10px] tracking-[0.1em] uppercase">
                    <span>Code</span>
                    <span>Type</span>
                    <span>Value</span>
                    <span>Uses</span>
                    <span>Status</span>
                    <span className="text-right">Actions</span>
                </div>
                {items.length === 0 ? (
                    <div className="px-5 py-8 font-mono text-[12px] text-sage text-center">
                        No promo codes yet. Create one above.
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item._id}
                            className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.6fr_0.5fr_1fr] gap-3 items-center px-5 py-3.5 border-t border-ink/10 font-sans text-[13px]"
                        >
                            <span className="font-mono text-[13px] font-medium tracking-wide">{item.code}</span>
                            <span className="text-sage text-[12px] capitalize">{item.type}</span>
                            <span className="font-mono text-[12px]">
                                {item.type === "percent" ? `${item.value}%` : `$${item.value}`}
                            </span>
                            <span className="font-mono text-[12px] text-sage">
                                {item.usedCount}{item.maxUses > 0 ? `/${item.maxUses}` : ""}
                            </span>
                            <span>
                                <button
                                    type="button"
                                    onClick={() => void handleToggle(item)}
                                    className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] tracking-wider cursor-pointer border-none ${
                                        item.enabled
                                            ? "bg-good/15 text-good"
                                            : "bg-ink/8 text-sage"
                                    }`}
                                >
                                    {item.enabled ? "ON" : "OFF"}
                                </button>
                            </span>
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(item)}
                                    className="font-mono text-[11px] text-wine underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-ink"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleDelete(item._id)}
                                    className="font-mono text-[11px] text-sage underline underline-offset-[3px] cursor-pointer bg-none border-none hover:text-wine"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
