import { Router } from "express";
import {
  getDashboardStats,
  getRevenueChart,
  getTopProducts,
  getCustomers,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", getDashboardStats);
router.get("/revenue-chart", getRevenueChart);
router.get("/top-products", getTopProducts);
router.get("/customers", getCustomers);

export default router;
