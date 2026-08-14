import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./Config/db.js";

// routes
import ItemRoutes from "./Routes/ItemRoutes.js";
import VisitRoutes from "./Routes/VisitRoutes.js";
import MuseumRoutes from "./Routes/MuseumRoutes.js";
import AuthRoutes from "./Routes/AuthRoutes.js";
import { ensureAdminFromEnvironment, requireAuth, requirePageAuth } from "./auth.js";

const app = express();

// fix __dirname per ES modules
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);;

// connessione a Mongo
connectDB().then(ensureAdminFromEnvironment).catch(error => {
    console.error("Bootstrap account error:", error.message);
    process.exit(1);
});

// middleware
app.use(cors());
app.use(express.json());

// API
app.use("/api/auth", AuthRoutes);
app.use("/api/items", requireAuth);
app.use("/api/visits", requireAuth);
app.use("/api/museum", requireAuth);
app.use("/api/items", ItemRoutes);
app.use("/api/visits", VisitRoutes);
app.use("/api/museum", MuseumRoutes);

// Le pagine dell'editor richiedono una sessione; gli asset restano pubblici.
app.use((req, res, next) => {
    const isPage = req.path === "/" || req.path.endsWith(".html");
    const isLoginPage = req.path === "/Login.html";
    if (!isPage || isLoginPage) return next();

    requirePageAuth(req, res, next);
});

// SERVIRE IL FRONTEND
app.use(express.static(path.join(__dirname, "../MarketPlace-Editor")));

// homepage
app.get("/", (req, res) => {
    res.redirect("/Index.html");
});

// avvio server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

