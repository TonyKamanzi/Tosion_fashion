import type { Request, Response } from "express";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import PromoCode from "../models/promo.model.js";
import { createNotification } from "./notification.controller.js";

// ==========================
// PLACE ORDER (customer, auth required)
// POST /orders — { shipping }
// ==========================

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!._id;
    const { shipping } = req.body;

    if (!shipping || !shipping.firstName || !shipping.email || !shipping.address1) {
      return res.status(400).json({ message: "Shipping information is required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // calculate totals from cart items
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingCost = subtotal >= 150 ? 0 : 12;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const discount = cart.promo?.discountAmount || 0;
    const total = Math.round((subtotal + shippingCost + tax - discount) * 100) / 100;

    // generate order number
    const orderNumber = `TS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // find promo doc if used
    let promoId = null;
    if (cart.promo?.code) {
      const promoDoc = await PromoCode.findOne({ code: cart.promo.code });
      if (promoDoc) {
        promoId = promoDoc._id;
        await PromoCode.findByIdAndUpdate(promoDoc._id, { $inc: { usedCount: 1 } });
      }
    }

    const order = await Order.create({
      user: userId,
      items: cart.items.map((i) => ({
        product: i.product || (i as unknown as Record<string, unknown>)._id,
        name: i.name,
        slug: i.slug,
        price: i.price,
        imageUrl: i.imageUrl,
        selectedColor: i.selectedColor,
        selectedSize: i.selectedSize,
        qty: i.qty,
      })),
      shipping,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      promoCode: cart.promo?.code || "",
      promoId,
      status: "pending",
      orderNumber,
    });

    // clear cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], saved: [], promo: null }
    );

    // create admin notification
    const customerName = `${shipping.firstName} ${shipping.lastName}`;
    const itemCount = order.items.length;
    await createNotification({
      type: "new_order",
      title: `New order #${orderNumber}`,
      message: `${customerName} placed an order for ${itemCount} item${itemCount !== 1 ? "s" : ""} — $${total.toLocaleString()}`,
      href: "/admin/orders",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to place order", error });
  }
};

// ==========================
// GET MY ORDERS (customer, auth required)
// ==========================

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ items: orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

// ==========================
// GET ALL ORDERS (admin)
// GET /orders?status=pending
// ==========================

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && typeof status === "string") {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ items: orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};

// ==========================
// GET ORDER DETAIL (admin or owner)
// ==========================

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.session.user!;

    const order = await Order.findById(id).populate("user", "firstName lastName email");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // allow admin or the order owner
    if (user.role !== "admin" && order.user._id.toString() !== user._id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error });
  }
};

// ==========================
// UPDATE ORDER STATUS (admin)
// PUT /orders/:id/status — { status }
// ==========================

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // notify admin of status change
    await createNotification({
      type: "order_status",
      title: `Order #${order.orderNumber} updated`,
      message: `Status changed to "${status}"`,
      href: "/admin/orders",
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status", error });
  }
};
