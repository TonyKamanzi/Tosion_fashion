"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";

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

type CartState = {
    items: CartItem[];
    saved: CartItem[];
};

type Action =
    | { type: "ADD"; item: CartItem }
    | { type: "REMOVE"; id: string }
    | { type: "UPDATE_QTY"; id: string; qty: number }
    | { type: "SAVE_FOR_LATER"; id: string }
    | { type: "MOVE_TO_BAG"; id: string }
    | { type: "CLEAR" };

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
            };
        }
        case "MOVE_TO_BAG": {
            const item = state.saved.find((i) => i._id === action.id);
            if (!item) return state;
            return {
                items: [...state.items, item],
                saved: state.saved.filter((i) => i._id !== action.id),
            };
        }
        case "CLEAR":
            return { items: [], saved: [] };
        default:
            return state;
    }
}

const STORAGE_KEY = "tosion_cart";

function loadState(): CartState {
    if (typeof window === "undefined") return { items: [], saved: [] };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { items: [], saved: [] };
}

type CartContextValue = CartState & {
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQty: (id: string, qty: number) => void;
    saveForLater: (id: string) => void;
    moveToBag: (id: string) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, undefined, loadState);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const addItem = (item: CartItem) => dispatch({ type: "ADD", item });
    const removeItem = (id: string) => dispatch({ type: "REMOVE", id });
    const updateQty = (id: string, qty: number) => dispatch({ type: "UPDATE_QTY", id, qty });
    const saveForLater = (id: string) => dispatch({ type: "SAVE_FOR_LATER", id });
    const moveToBag = (id: string) => dispatch({ type: "MOVE_TO_BAG", id });
    const clearCart = () => dispatch({ type: "CLEAR" });

    return (
        <CartContext.Provider value={{ ...state, addItem, removeItem, updateQty, saveForLater, moveToBag, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
