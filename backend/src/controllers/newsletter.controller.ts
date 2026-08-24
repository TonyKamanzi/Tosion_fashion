import type { Request, Response } from "express";
import NewsletterContent from "../models/newsletter.model.js";

// text fields the admin is allowed to set via PUT /newsletter
const EDITABLE_TEXT_FIELDS = [
  "title",
  "placeholder",
  "buttonLabel",
  "subscribedLabel",
] as const;

// ==========================
// GET NEWSLETTER CONTENT (public)
// ==========================

export const getNewsletter = async (_req: Request, res: Response) => {
  try {
    let newsletter = await NewsletterContent.findOne();

    // first call seeds the singleton so the storefront always has content
    if (!newsletter) {
      newsletter = await NewsletterContent.create({});
    }

    res.status(200).json(newsletter);
  } catch (error) {
    console.error("Get newsletter error:", error);

    res.status(500).json({
      message: "Failed to load newsletter content",
    });
  }
};

// ==========================
// UPDATE NEWSLETTER CONTENT (admin)
// ==========================

export const updateNewsletter = async (req: Request, res: Response) => {
  try {
    const updates: Record<string, unknown> = req.body ?? {};

    let newsletter = await NewsletterContent.findOne();
    if (!newsletter) {
      newsletter = await NewsletterContent.create({});
    }

    for (const field of EDITABLE_TEXT_FIELDS) {
      const value = updates[field];

      if (typeof value === "string") {
        newsletter.set(field, value.trim());
      }
    }

    await newsletter.save();

    res.status(200).json(newsletter);
  } catch (error) {
    console.error("Update newsletter error:", error);

    res.status(500).json({
      message: "Failed to update newsletter content",
    });
  }
};
