import type { Request, Response } from "express";
import Review from "../models/review.model.js";

function textOr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

// ==========================
// GET REVIEWS FOR A PRODUCT (public — enabled only)
// Returns items + computed averageRating + reviewCount
// ==========================

export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const reviews = await Review.find({ product: productId, enabled: true })
      .sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
        : 0;

    res.status(200).json({ items: reviews, averageRating, reviewCount });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

// ==========================
// CREATE REVIEW (public — any visitor can submit)
// ==========================

export const createReview = async (req: Request, res: Response) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;

    const product = textOr(body.product);
    if (!product) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const name = textOr(body.name);
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const rating = Number(body.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const bodyText = textOr(body.body);
    if (!bodyText) {
      return res.status(400).json({ message: "Review body is required" });
    }

    const created = await Review.create({
      product,
      name,
      rating,
      title: textOr(body.title),
      body: bodyText,
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
};

// ==========================
// DELETE REVIEW (admin)
// ==========================

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
