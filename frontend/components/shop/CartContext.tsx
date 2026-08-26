"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react";

export type CartItem = {
    _id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    imageAltUrl: string;
    category: { label: string; slug: string } | null;
    selectedColor: { name: string; hex: string } | null;
    selectedSize: string;
    qty: number;
};

export type PromoInfo = {
    code: string;
    type: string;
    value: number;
    discountAmount: number;
} | null;

type CartState = {
    items: CartItem[];
    saved: CartItem[];
    promo: PromoInfo;
};

type Action =
    | { type: "ADD"; item: CartItem }
    | { type: "REMOVE"; id: string }
    | { type: "UPDATE_QTY"; id: string; qty: number }
    | { type: "SAVE_FOR_LATER"; id: string }
    | { type: "MOVE_TO_BAG"; id: string }
    | { type: "CLEAR" }
    | { type: "APPLY_PROMO"; promo: PromoInfo }
    | { type: "REMOVE_PROMO" };

function cartReducer(state: CartState, action: Action): CartState {
    switch (action.type) {
        case "ADD": {
            const existing = state.items.find(
                (i) =>
                    i._id === action.item._id &&
                    i.selectedColor?.hex === action.item.selectedColor?.hex &&
                    i.selectedSize === action.item.selectedSize
            );
            if (existing) {
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i === existing ? { ...i, qty: i.qty + action.item.qty } : i
                    ),
                };
            }
            return { ...state, items: [...state.items, action.item] };
        }
        case "REMOVE":
            return {
                ...state,
                items: state.items.filter((i) => i._id !== action.id),
            };
        case "UPDATE_QTY":
            return {
                ...state,
                items: state.items.map((i) =>
                    i._id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i
                ),
            };
        case "SAVE_FOR_LATER": {
            const item = state.items.find((i) => i._id === action.id);
            if (!item) return state;
            return {
                items: state.items.filter((i) => i._id !== action.id),
                saved: [...state.saved, item],
                promo: state.promo,
            };
        }
        case "MOVE_TO_BAG": {
            const item = state.saved.find((i) => i._id === action.id);
            if (!item) return state;
            return {
                items: [...state.items, item],
                saved: state.saved.filter((i) => i._id !== action.id),
                promo: state.promo,
            };
        }
        case "CLEAR":
            return { items: [], saved: [], promo: null };
        case "APPLY_PROMO":
            return { ...state, promo: action.promo };
        case "REMOVE_PROMO":
            return { ...state, promo: null };
        default:
            return state;
    }
}

const STORAGE_KEY = "tosion_cart";

function loadState(): CartState {
    if (typeof window === "undefined") return { items: [], saved: [], promo: null };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { items: parsed.items || [], saved: parsed.saved || [], promo: parsed.promo || null };
        }
    } catch { /* ignore */ }
    return { items: [], saved: [], promo: null };
}

type CartContextValue = CartState & {
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQty: (id: string, qty: number) => void;
    saveForLater: (id: string) => void;
    moveToBag: (id: string) => void;
    clearCart: () => void;
    applyPromo: (promo: PromoInfo) => void;
    removePromo: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, undefined, loadState);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const addItem = useCallback((item: CartItem) => dispatch({ type: "ADD", item }), []);
    const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE", id }), []);
    const updateQty = useCallback((id: string, qty: number) => dispatch({ type: "UPDATE_QTY", id, qty }), []);
    const saveForLater = useCallback((id: string) => dispatch({ type: "SAVE_FOR_LATER", id }), []);
    const moveToBag = useCallback((id: string) => dispatch({ type: "MOVE_TO_BAG", id }), []);
    const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
    const applyPromo = useCallback((promo: PromoInfo) => dispatch({ type: "APPLY_PROMO", promo }), []);
    const removePromo = useCallback(() => dispatch({ type: "REMOVE_PROMO" }), []);

    return (
        <CartContext.Provider value={{ ...state, addItem, removeItem, updateQty, saveForLater, moveToBag, clearCart, applyPromo, removePromo }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
