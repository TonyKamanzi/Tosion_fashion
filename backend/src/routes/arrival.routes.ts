import express from "express";
import {
  getArrivals,
  getArrivalHeader,
  updateArrivalHeader,
  createArrival,
  updateArrival,
  deleteArrival,
} from "../controllers/arrival.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// NOTE: "/header" routes must be registered before PUT "/:id",
// otherwise "header" would be captured as an id
router.get("/", getArrivals);
router.get("/header", getArrivalHeader);
router.put("/header", requireAdmin, updateArrivalHeader);
router.post("/", requireAdmin, createArrival);
router.put("/:id", requireAdmin, updateArrival);
router.delete("/:id", requireAdmin, deleteArrival);

export default router;
