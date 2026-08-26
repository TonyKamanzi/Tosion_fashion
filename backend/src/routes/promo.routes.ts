import { Router } from "express";
import {
  validatePromo,
  getPromos,
  createPromo,
  updatePromo,
  deletePromo,
  incrementUseCount,
} from "../controllers/promo.controller.js";

const router = Router();

// public
router.post("/validate", validatePromo);

// admin
router.get("/", getPromos);
router.post("/", createPromo);
router.put("/:id", updatePromo);
router.delete("/:id", deletePromo);
router.post("/:id/use", incrementUseCount);

export default router;
