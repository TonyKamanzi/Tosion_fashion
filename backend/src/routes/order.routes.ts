import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// customer
router.post("/", requireAuth, placeOrder);
router.get("/mine", requireAuth, getMyOrders);

// admin
router.get("/", requireAuth, requireAdmin, getAllOrders);
router.get("/:id", requireAuth, getOrder);
router.put("/:id/status", requireAuth, requireAdmin, updateOrderStatus);

export default router;
