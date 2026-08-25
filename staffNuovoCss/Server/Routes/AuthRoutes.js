import express from "express";
import { login, logout, requireAuth } from "../auth.js";

const router = express.Router();
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, (req, res) => res.json({
    email: req.user.email,
    museum: req.user.museumId
}));

export default router;
