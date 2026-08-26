import { Router } from "express";
import { getCart, putCart } from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

router.get("/", getCart);
router.put("/", putCart);

export default router;
