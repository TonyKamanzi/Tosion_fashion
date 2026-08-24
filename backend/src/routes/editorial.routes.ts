import express from "express";
import { getEditorial, updateEditorial } from "../controllers/editorial.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

router.get("/", getEditorial);
router.put("/", requireAdmin, updateEditorial);

export default router;
