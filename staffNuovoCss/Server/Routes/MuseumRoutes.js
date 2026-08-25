import express from "express";

import {
    getMuseum,
    saveMuseum,
    getMuseumQr
} from "../Controllers/museumController.js";

const router = express.Router();

router.get("/", getMuseum);
router.get("/qr", getMuseumQr);
router.put("/", saveMuseum);

export default router;
