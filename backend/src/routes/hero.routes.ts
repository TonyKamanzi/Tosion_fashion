import express from "express";
import { getHero, updateHero } from "../controllers/hero.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

router.get("/", getHero);
router.put("/", requireAdmin, updateHero);

export default router;
