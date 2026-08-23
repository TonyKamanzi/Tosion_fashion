import type { Request, Response } from "express";
import HeroContent from "../models/hero.model.js";

// text fields the admin is allowed to set via PUT /hero
const EDITABLE_TEXT_FIELDS = [
  "imageUrl",
  "imageAlt",
  "badge",
  "eyebrow",
  "headlinePre",
  "headlineItalic",
  "headlinePost",
  "description",
  "ctaLabel",
  "ctaHref",
] as const;

// ==========================
// GET HERO CONTENT (public)
// ==========================

export const getHero = async (_req: Request, res: Response) => {
  try {
    let hero = await HeroContent.findOne();

    // first call seeds the singleton so the storefront always has content
    if (!hero) {
      hero = await HeroContent.create({});
    }

    res.status(200).json(hero);
  } catch (error) {
    console.error("Get hero error:", error);

    res.status(500).json({
      message: "Failed to load hero content",
    });
  }
};

// ==========================
// UPDATE HERO CONTENT (admin)
// ==========================

export const updateHero = async (req: Request, res: Response) => {
  try {
    const updates: Record<string, unknown> = req.body ?? {};

    let hero = await HeroContent.findOne();
    if (!hero) {
      hero = await HeroContent.create({});
    }

    for (const field of EDITABLE_TEXT_FIELDS) {
      const value = updates[field];

      if (typeof value === "string") {
        hero.set(field, value);
      }
    }

    if (Array.isArray(updates.marqueeItems)) {
      const items: { text: string; enabled: boolean }[] = [];

      for (const item of updates.marqueeItems) {
        if (
          item &&
          typeof item === "object" &&
          typeof (item as { text?: unknown }).text === "string" &&
          (item as { text: string }).text.trim()
        ) {
          const { text } = item as { text: string };
          const enabled = (item as { enabled?: unknown }).enabled;

          items.push({
            text: text.trim(),
            enabled: enabled !== false,
          });
        }
      }

      hero.set("marqueeItems", items);
    }

    await hero.save();

    res.status(200).json(hero);
  } catch (error) {
    console.error("Update hero error:", error);

    res.status(500).json({
      message: "Failed to update hero content",
    });
  }
};
