"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, type ReactNode } from "react";
import axios from "axios";
import { useCustomerSession } from "./CustomerSessionContext";
import { API_URL } from "@/lib/api";

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
    | { type: "REMOVE_PROMO" }
    | { type: "LOAD_SERVER"; items: CartItem[]; saved: CartItem[]; promo: PromoInfo };

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
        case "LOAD_SERVER":
            return { items: action.items, saved: action.saved, promo: action.promo };
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
    const { user } = useCustomerSession();
    const [state, dispatch] = useReducer(cartReducer, undefined, loadState);
    const hasSyncedRef = useRef(false);

    // persist to localStorage (always, for guests)
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // when user logs in, load server cart
    useEffect(() => {
        if (!user) {
            hasSyncedRef.current = false;
            return;
        }
        if (hasSyncedRef.current) return;
        hasSyncedRef.current = true;

        void (async () => {
            try {
                const { data } = await axios.get<{
                    items: CartItem[];
                    saved: CartItem[];
                    promo: PromoInfo;
                }>(`${API_URL}/cart`, { withCredentials: true });

                const localState = loadState();
                const serverHasItems = data.items && data.items.length > 0;
                const localHasItems = localState.items.length > 0;

                if (serverHasItems && !localHasItems) {
                    // server has items, local is empty — load from server
                    dispatch({ type: "LOAD_SERVER", items: data.items, saved: data.saved || [], promo: data.promo || null });
                } else if (localHasItems && !serverHasItems) {
                    // local has items, server is empty — push to server
                    await axios.put(`${API_URL}/cart`, localState, { withCredentials: true });
                } else if (serverHasItems && localHasItems) {
                    // both have items — server wins
                    dispatch({ type: "LOAD_SERVER", items: data.items, saved: data.saved || [], promo: data.promo || null });
                    await axios.put(`${API_URL}/cart`, {
                        items: data.items,
                        saved: data.saved || [],
                        promo: data.promo || null,
                    }, { withCredentials: true });
                }
            } catch { /* ignore — stay with localStorage */ }
        })();
    }, [user]);

    // sync to server on every cart change when logged in (debounced)
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!user) return;

        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
            void axios.put(`${API_URL}/cart`, state, { withCredentials: true });
        }, 500);

        return () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, [user, state]);

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
