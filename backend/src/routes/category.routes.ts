import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", requireAdmin, createCategory);
router.put("/:id", requireAdmin, updateCategory);
router.delete("/:id", requireAdmin, deleteCategory);

export default router;
