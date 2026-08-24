import express from "express";
import {
  getProducts,
  getProductCounts,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// public listing endpoints (specific paths before any param routes)
router.get("/", getProducts);
router.get("/counts", getProductCounts);
router.get("/admin/list", requireAdmin, getAdminProducts);

// admin mutations
router.post("/", requireAdmin, createProduct);
router.put("/:id", requireAdmin, updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);

export default router;
