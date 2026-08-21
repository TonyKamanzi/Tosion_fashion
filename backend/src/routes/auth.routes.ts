import express from "express"
import { login, signup, logout, getUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", signup)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", getUser)

export default router;
