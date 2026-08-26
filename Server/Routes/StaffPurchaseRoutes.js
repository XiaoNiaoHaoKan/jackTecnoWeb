import express from "express";
import {
  getStaffPurchases,
  markPurchaseAsRead,
} from "../Controllers/MarketplacePurchaseController.js";

const router = express.Router();

router.get("/", getStaffPurchases);
router.patch("/:id/read", markPurchaseAsRead);

export default router;
