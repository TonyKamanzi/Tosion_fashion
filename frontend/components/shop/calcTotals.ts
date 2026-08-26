import type { CartItem, PromoInfo } from "./CartContext";

export type Totals = {
    totalItems: number;
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
};

export function calcTotals(items: CartItem[], promo: PromoInfo): Totals {
    const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shipping = subtotal >= 150 ? 0 : 12;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const discount = promo?.discountAmount || 0;
    const total = Math.round((subtotal + shipping + tax - discount) * 100) / 100;

    return { totalItems, subtotal, shipping, tax, discount, total };
}
