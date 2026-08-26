import type { Request, Response } from "express";
import PromoCode from "../models/promo.model.js";

// ==========================
// VALIDATE PROMO CODE (public)
// POST /promos/validate — { code, subtotal }
// ==========================

export const validatePromo = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ valid: false, message: "Code is required" });
    }
    if (subtotal == null || typeof subtotal !== "number" || subtotal < 0) {
      return res.status(400).json({ valid: false, message: "Subtotal is required" });
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });

    if (!promo) {
      return res.status(404).json({ valid: false, message: "Invalid promo code" });
    }
    if (!promo.enabled) {
      return res.status(400).json({ valid: false, message: "This code is no longer active" });
    }
    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ valid: false, message: "This code has been fully redeemed" });
    }
    if (subtotal < promo.minOrder) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order of $${promo.minOrder} required`,
      });
    }

    let discountAmount = 0;
    if (promo.type === "percent") {
      discountAmount = Math.round((subtotal * promo.value / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(promo.value, subtotal);
    }

    res.status(200).json({
      valid: true,
      code: promo.code,
      type: promo.type,
      value: promo.value,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to validate promo code", error });
  }
};

// ==========================
// GET ALL PROMOS (admin)
// ==========================

export const getPromos = async (_req: Request, res: Response) => {
  try {
    const items = await PromoCode.find().sort({ createdAt: -1 });
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch promo codes", error });
  }
};

// ==========================
// CREATE PROMO (admin)
// ==========================

export const createPromo = async (req: Request, res: Response) => {
  try {
    const { code, type, value, minOrder, maxUses, enabled } = req.body;

    if (!code || !type || value == null) {
      return res.status(400).json({ message: "code, type, and value are required" });
    }
    if (!["percent", "fixed"].includes(type)) {
      return res.status(400).json({ message: "type must be 'percent' or 'fixed'" });
    }
    if (type === "percent" && (value < 0 || value > 100)) {
      return res.status(400).json({ message: "Percent value must be between 0 and 100" });
    }

    const existing = await PromoCode.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "A promo code with this name already exists" });
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase().trim(),
      type,
      value,
      minOrder: minOrder || 0,
      maxUses: maxUses || 0,
      enabled: enabled !== false,
    });

    res.status(201).json(promo);
  } catch (error) {
    res.status(500).json({ message: "Failed to create promo code", error });
  }
};

// ==========================
// UPDATE PROMO (admin)
// ==========================

export const updatePromo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, type, value, minOrder, maxUses, enabled } = req.body;

    if (type && !["percent", "fixed"].includes(type)) {
      return res.status(400).json({ message: "type must be 'percent' or 'fixed'" });
    }

    const update: Record<string, unknown> = {};
    if (code !== undefined) update.code = code.toUpperCase().trim();
    if (type !== undefined) update.type = type;
    if (value !== undefined) update.value = value;
    if (minOrder !== undefined) update.minOrder = minOrder;
    if (maxUses !== undefined) update.maxUses = maxUses;
    if (enabled !== undefined) update.enabled = enabled;

    const promo = await PromoCode.findByIdAndUpdate(id, update, { new: true });
    if (!promo) {
      return res.status(404).json({ message: "Promo code not found" });
    }

    res.status(200).json(promo);
  } catch (error) {
    res.status(500).json({ message: "Failed to update promo code", error });
  }
};

// ==========================
// DELETE PROMO (admin)
// ==========================

export const deletePromo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promo = await PromoCode.findByIdAndDelete(id);
    if (!promo) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.status(200).json({ message: "Promo code deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete promo code", error });
  }
};

// ==========================
// INCREMENT USE COUNT (called after order placement)
// POST /promos/:id/use
// ==========================

export const incrementUseCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promo = await PromoCode.findByIdAndUpdate(
      id,
      { $inc: { usedCount: 1 } },
      { new: true }
    );
    if (!promo) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.status(200).json(promo);
  } catch (error) {
    res.status(500).json({ message: "Failed to update use count", error });
  }
};
