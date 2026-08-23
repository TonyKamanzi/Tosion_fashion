import type { Request, Response } from "express";
import Category, { DEFAULT_CATEGORIES } from "../models/category.model.js";

// "Winter Knits" -> "winter-knits"
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// populate the collection with defaults the first time anything reads it
async function ensureSeeded() {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
  }
}

async function nextOrder(): Promise<number> {
  const last = await Category.findOne().sort({ order: -1 });
  return last ? last.order + 1 : 1;
}

// ==========================
// LIST CATEGORIES (public)
// ==========================

export const getCategories = async (_req: Request, res: Response) => {
  try {
    await ensureSeeded();

    const categories = await Category.find().sort({ order: 1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      message: "Failed to load categories",
    });
  }
};

// ==========================
// CREATE CATEGORY (admin)
// ==========================

export const createCategory = async (req: Request, res: Response) => {
  try {
    const body: Record<string, unknown> = req.body ?? {};
    const label = typeof body.label === "string" ? body.label.trim() : "";

    if (!label) {
      return res.status(400).json({
        message: "Label is required",
      });
    }

    const slug = slugify(label);
    if (!slug) {
      return res.status(400).json({
        message: "Label must contain letters or numbers",
      });
    }

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        message: `A category with slug "${slug}" already exists`,
      });
    }

    const category = await Category.create({
      label,
      slug,
      eyebrow: typeof body.eyebrow === "string" ? body.eyebrow.trim() : "",
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : "",
      imageAlt: typeof body.imageAlt === "string" ? body.imageAlt.trim() : "",
      enabled: body.enabled !== false,
      order: await nextOrder(),
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      message: "Failed to create category",
    });
  }
};

// ==========================
// UPDATE CATEGORY (admin)
// ==========================

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Record<string, unknown> = req.body ?? {};

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // label
    if (typeof updates.label === "string" && updates.label.trim()) {
      category.set("label", updates.label.trim());
    }

    // slug: explicit override wins, otherwise re-derive when the label changes
    let candidateSlug = "";
    let slugWasProvided = false;
    if (typeof updates.slug === "string" && updates.slug.trim()) {
      candidateSlug = slugify(updates.slug);
      slugWasProvided = true;
    } else if (
      typeof updates.label === "string" &&
      updates.label.trim() &&
      category.isModified("label")
    ) {
      candidateSlug = slugify(updates.label);
    }

    if (slugWasProvided && !candidateSlug) {
      return res.status(400).json({
        message: "Slug must contain letters or numbers",
      });
    }

    if (candidateSlug && candidateSlug !== category.slug) {
      const existing = await Category.findOne({ slug: candidateSlug });
      if (existing && String(existing._id) !== String(category._id)) {
        return res.status(409).json({
          message: `A category with slug "${candidateSlug}" already exists`,
        });
      }

      category.set("slug", candidateSlug);
    }

    if (typeof updates.eyebrow === "string") category.set("eyebrow", updates.eyebrow.trim());
    if (typeof updates.imageUrl === "string") category.set("imageUrl", updates.imageUrl.trim());
    if (typeof updates.imageAlt === "string") category.set("imageAlt", updates.imageAlt.trim());
    if (typeof updates.enabled === "boolean") category.set("enabled", updates.enabled);
    if (typeof updates.order === "number" && Number.isFinite(updates.order)) {
      category.set("order", updates.order);
    }

    await category.save();

    res.status(200).json(category);
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      message: "Failed to update category",
    });
  }
};

// ==========================
// DELETE CATEGORY (admin)
// ==========================

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      message: "Category deleted",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      message: "Failed to delete category",
    });
  }
};
