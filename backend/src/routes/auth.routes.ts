import express from "express"
import { login, signup, logout, getUser, googleLogin, googleCallback } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", signup)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", getUser)

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

export default router;
