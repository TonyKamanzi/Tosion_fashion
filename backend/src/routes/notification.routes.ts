import { Router } from "express";
import {
  getNotifications,
  markAllRead,
  markOneRead,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getNotifications);
router.put("/read", markAllRead);
router.put("/:id/read", markOneRead);

export default router;
