import express from "express";
import { getNewsletter, updateNewsletter } from "../controllers/newsletter.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

router.get("/", getNewsletter);
router.put("/", requireAdmin, updateNewsletter);

export default router;
