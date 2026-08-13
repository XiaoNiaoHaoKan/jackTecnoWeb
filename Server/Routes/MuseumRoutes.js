import express from "express";
import { getMuseum, saveMuseum } from "../Controllers/museumController.js";

const router = express.Router();

router.get("/", getMuseum);
router.put("/", saveMuseum);

export default router;
