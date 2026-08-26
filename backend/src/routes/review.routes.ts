import express from "express";
import {
  getReviewsByProduct,
  createReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// public
router.get("/product/:productId", getReviewsByProduct);
router.post("/", createReview);

// admin
router.delete("/:id", requireAdmin, deleteReview);

export default router;
