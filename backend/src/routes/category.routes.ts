import express from "express";
import {
  getCategories,
  getCategoryHeader,
  updateCategoryHeader,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// NOTE: "/header" routes must be registered before PUT "/:id",
// otherwise "header" would be captured as an id
router.get("/", getCategories);
router.get("/header", getCategoryHeader);
router.put("/header", requireAdmin, updateCategoryHeader);
router.post("/", requireAdmin, createCategory);
router.put("/:id", requireAdmin, updateCategory);
router.delete("/:id", requireAdmin, deleteCategory);

export default router;
