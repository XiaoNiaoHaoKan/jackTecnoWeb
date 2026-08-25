import crypto from "crypto";
import User from "./Models/users.js";

const sessions = new Map();
const SESSION_COOKIE = "artaroud_session";
const SESSION_DURATION = 1000 * 60 * 60 * 8;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    const [salt, expected] = storedHash.split(":");
    const actual = crypto.scryptSync(password, salt, 64).toString("hex");
    return expected && actual.length === expected.length && crypto.timingSafeEqual(
        Buffer.from(actual),
        Buffer.from(expected)
    );
}

function readCookie(request, name) {
    const cookies = request.headers.cookie?.split(";") || [];
    const cookie = cookies.find(value => value.trim().startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null;
}

export async function login(request, response) {
    const email = String(request.body.email || "").trim().toLowerCase();
    const password = String(request.body.password || "");

    if (!email || !password) {
        return response.status(400).json({ message: "Email e password sono obbligatorie" });
    }

    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.passwordHash)) {
        return response.status(401).json({ message: "Credenziali non valide" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { userId: user._id.toString(), expiresAt: Date.now() + SESSION_DURATION });
    response.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION / 1000}`);
    return response.json({ email: user.email });
}

export function logout(request, response) {
    const token = readCookie(request, SESSION_COOKIE);
    if (token) sessions.delete(token);
    response.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
    response.json({ message: "Logout effettuato" });
}

export async function requireAuth(request, response, next) {
    try {
        const token = readCookie(request, SESSION_COOKIE);
        const session = token && sessions.get(token);
        if (!session || session.expiresAt < Date.now()) {
            if (token) sessions.delete(token);
            return response.status(401).json({ message: "Autenticazione richiesta" });
        }

        const user = await User.findById(session.userId).populate("museumId");
        if (!user) return response.status(401).json({ message: "Account non valido" });
        request.user = user;
        next();
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}

export async function requirePageAuth(request, response, next) {
    const originalJson = response.json.bind(response);
    response.json = payload => {
        if (response.statusCode === 401) return response.redirect("/Login.html");
        return originalJson(payload);
    };
    return requireAuth(request, response, next);
}

export async function ensureAdminFromEnvironment() {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_MUSEUM_ID } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const museumId = ADMIN_MUSEUM_ID || (await (await import("./Models/museum.js")).default.findOne())?._id;
    if (!museumId) throw new Error("Impossibile creare l'account: nessun museo disponibile");

    const existing = await User.findOne({ email });
    if (!existing) {
        await User.create({ email, passwordHash: hashPassword(ADMIN_PASSWORD), museumId });
        console.log(`Account amministratore creato per ${email}`);
    }
}
