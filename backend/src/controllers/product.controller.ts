import type { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

const PAGE_LIMIT = 9;

// sort keys accepted on GET /products
const SORT_OPTIONS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  name: { name: 1 },
};

type ColorInput = { name: string; hex: string };

// ==========================
// INPUT SANITIZERS (shared by create + update)
// ==========================

function toPrice(value: unknown): number | null {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN;

  return Number.isFinite(num) && num >= 0 ? num : null;
}

function sanitizeSizes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const sizes: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const size = item.trim();
      if (size && !sizes.includes(size)) sizes.push(size);
    }
  }
  return sizes;
}

function sanitizeColors(value: unknown): ColorInput[] {
  if (!Array.isArray(value)) return [];

  const colors: ColorInput[] = [];
  for (const item of value) {
    if (item && typeof item === "object") {
      const raw = item as { name?: unknown; hex?: unknown };
      const hex = typeof raw.hex === "string" ? raw.hex.trim() : "";
      const name = typeof raw.name === "string" ? raw.name.trim() : "";

      if (hex) colors.push({ name, hex });
    }
  }
  return colors;
}

// resolves a category id string to an existing Category, or null
async function resolveCategory(value: unknown) {
  if (typeof value !== "string" || !mongoose.isValidObjectId(value)) return null;
  return Category.findById(value);
}

function textOr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

// ==========================
// LIST PRODUCTS (public — enabled only, paginated)
// ==========================

export const getProducts = async (req: Request, res: Response) => {
  try {
    const catSlug = textOr(req.query.category, "all") || "all";
    const sortKey = textOr(req.query.sort) in SORT_OPTIONS
      ? textOr(req.query.sort)
      : "newest";

    const requestedPage = Number.parseInt(textOr(req.query.page, "1"), 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

    // optional override so a listing page can pull the whole catalog at once;
    // clamped to keep queries sane
    const requestedLimit = Number.parseInt(textOr(req.query.limit, String(PAGE_LIMIT)), 10);
    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : PAGE_LIMIT;

    // unknown slug → empty payload rather than an error
    let categoryFilter: Record<string, unknown> = {};
    if (catSlug !== "all") {
      const category = await Category.findOne({ slug: catSlug });
      if (!category) {
        return res.status(200).json({ items: [], total: 0, page: 1, pages: 1, limit: PAGE_LIMIT });
      }
      categoryFilter = { category: category._id };
    }

    const filter = { enabled: true, ...categoryFilter };
    const total = await Product.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, pages);

    const items = await Product.find(filter)
      .sort(SORT_OPTIONS[sortKey])
      .skip((safePage - 1) * limit)
      .limit(limit)
      .populate("category", "label slug");

    res.status(200).json({ items, total, page: safePage, pages, limit });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Failed to load products",
    });
  }
};

// ==========================
// PRODUCT COUNTS PER CATEGORY (public — feeds the shop sidebar)
// returns every enabled category with its enabled-product count
// ==========================

export const getProductCounts = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({ enabled: true }).sort({ order: 1 });

    const counts = (await Product.aggregate<{ _id: unknown; count: number }>([
      { $match: { enabled: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ])) as { _id: unknown; count: number }[];

    const byCategoryId = new Map(counts.map((entry) => [String(entry._id), entry.count]));

    const result = categories.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      count: byCategoryId.get(String(cat._id)) ?? 0,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Get product counts error:", error);

    res.status(500).json({
      message: "Failed to load product counts",
    });
  }
};

// ==========================
// LIST ALL PRODUCTS (admin — includes hidden, no pagination)
// NOTE: registered as /products/admin/list
// ==========================

export const getAdminProducts = async (_req: Request, res: Response) => {
  try {
    const items = await Product.find()
      .sort({ createdAt: -1 })
      .populate("category", "label slug");

    res.status(200).json(items);
  } catch (error) {
    console.error("Get admin products error:", error);

    res.status(500).json({
      message: "Failed to load products",
    });
  }
};

// ==========================
// CREATE PRODUCT (admin)
// ==========================

export const createProduct = async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;

    const name = textOr(body.name);
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const price = toPrice(body.price);
    if (price === null) {
      return res.status(400).json({ message: "A valid price is required" });
    }

    const category = await resolveCategory(body.category);
    if (!category) {
      return res.status(400).json({ message: "An existing category is required" });
    }

    const compareAtPrice = body.compareAtPrice === "" || body.compareAtPrice === null
      ? null
      : toPrice(body.compareAtPrice);

    const created = await Product.create({
      name,
      description: textOr(body.description),
      price,
      compareAtPrice,
      imageUrl: textOr(body.imageUrl),
      imageAltUrl: textOr(body.imageAltUrl),
      imageAlt: textOr(body.imageAlt),
      tag: textOr(body.tag),
      sizes: sanitizeSizes(body.sizes),
      colors: sanitizeColors(body.colors),
      category: category._id,
      enabled: body.enabled !== false,
    });

    const product = await created.populate("category", "label slug");

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

// ==========================
// UPDATE PRODUCT (admin)
// ==========================

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = (req.body ?? {}) as Record<string, unknown>;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const name = textOr(body.name);
    if (name) product.set("name", name);

    if (typeof body.description === "string") product.set("description", body.description.trim());
    if (typeof body.imageUrl === "string") product.set("imageUrl", body.imageUrl.trim());
    if (typeof body.imageAltUrl === "string") product.set("imageAltUrl", body.imageAltUrl.trim());
    if (typeof body.imageAlt === "string") product.set("imageAlt", body.imageAlt.trim());
    if (typeof body.tag === "string") product.set("tag", body.tag.trim());

    const price = toPrice(body.price);
    if (price !== null) product.set("price", price);

    // empty string / null clears the was-price, valid numbers set it
    if (body.compareAtPrice === "" || body.compareAtPrice === null) {
      product.set("compareAtPrice", null);
    } else {
      const compareAtPrice = toPrice(body.compareAtPrice);
      if (compareAtPrice !== null) product.set("compareAtPrice", compareAtPrice);
    }

    if (body.category !== undefined) {
      const category = await resolveCategory(body.category);
      if (!category) {
        return res.status(400).json({ message: "Category not found" });
      }
      product.set("category", category._id);
    }

    if (Array.isArray(body.sizes)) product.set("sizes", sanitizeSizes(body.sizes));
    if (Array.isArray(body.colors)) product.set("colors", sanitizeColors(body.colors));
    if (typeof body.enabled === "boolean") product.set("enabled", body.enabled);

    await product.save();

    const updated = await product.populate("category", "label slug");

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

// ==========================
// DELETE PRODUCT (admin)
// ==========================

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};
