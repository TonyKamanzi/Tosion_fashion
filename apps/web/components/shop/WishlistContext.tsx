"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useCart } from "./CartContext";

export type WishlistItem = {
    _id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    imageAltUrl: string;
    category: { label: string; slug: string } | null;
};

type WishlistContextValue = {
    items: WishlistItem[];
    toggleWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    moveToBag: (item: WishlistItem) => void;
};

const STORAGE_KEY = "tosion_wishlist";

function loadItems(): WishlistItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return [];
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>(loadItems);
    const { addItem } = useCart();

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const toggleWishlist = useCallback((item: WishlistItem) => {
        setItems((prev) => {
            const exists = prev.some((i) => i._id === item._id);
            if (exists) return prev.filter((i) => i._id !== item._id);
            return [...prev, item];
        });
    }, []);

    const removeFromWishlist = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i._id !== id));
    }, []);

    const isInWishlist = useCallback(
        (id: string) => items.some((i) => i._id === id),
        [items]
    );

    const moveToBag = useCallback(
        (item: WishlistItem) => {
            addItem({
                ...item,
                selectedColor: null,
                selectedSize: "",
                qty: 1,
            });
            setItems((prev) => prev.filter((i) => i._id !== item._id));
        },
        [addItem]
    );

    return (
        <WishlistContext.Provider value={{ items, toggleWishlist, removeFromWishlist, isInWishlist, moveToBag }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}
