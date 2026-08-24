import type { Request, Response } from "express";
import EditorialContent from "../models/editorial.model.js";

// text fields the admin is allowed to set via PUT /editorial
const EDITABLE_TEXT_FIELDS = [
  "imageUrl",
  "imageAlt",
  "eyebrow",
  "quote",
  "attribution",
] as const;

// ==========================
// GET EDITORIAL CONTENT (public)
// ==========================

export const getEditorial = async (_req: Request, res: Response) => {
  try {
    let editorial = await EditorialContent.findOne();

    // first call seeds the singleton so the storefront always has content
    if (!editorial) {
      editorial = await EditorialContent.create({});
    }

    res.status(200).json(editorial);
  } catch (error) {
    console.error("Get editorial error:", error);

    res.status(500).json({
      message: "Failed to load editorial content",
    });
  }
};

// ==========================
// UPDATE EDITORIAL CONTENT (admin)
// ==========================

export const updateEditorial = async (req: Request, res: Response) => {
  try {
    const updates: Record<string, unknown> = req.body ?? {};

    let editorial = await EditorialContent.findOne();
    if (!editorial) {
      editorial = await EditorialContent.create({});
    }

    for (const field of EDITABLE_TEXT_FIELDS) {
      const value = updates[field];

      if (typeof value === "string") {
        editorial.set(field, value.trim());
      }
    }

    await editorial.save();

    res.status(200).json(editorial);
  } catch (error) {
    console.error("Update editorial error:", error);

    res.status(500).json({
      message: "Failed to update editorial content",
    });
  }
};
