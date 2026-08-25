import "dotenv/config";
import mongoose from "mongoose";
import crypto from "crypto";
import Museum from "./Models/museum.js";
import User from "./Models/users.js";

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

const accounts = [
    {
        email: "account@email.com",
        password: "12345678",
        museum: { name: "Museo Demo A", city: "Roma", description: "Account dimostrativo A" }
    },
    {
        email: "account2@email.com",
        password: "12345678",
        museum: { name: "Museo Demo B", city: "Milano", description: "Account dimostrativo B" }
    }
];

try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI non definita");
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({ email: { $in: ["demo.museo.a@example.com", "demo.museo.b@example.com"] } });

    for (const account of accounts) {
        const museum = await Museum.findOneAndUpdate(
            { name: account.museum.name },
            account.museum,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        await User.findOneAndUpdate(
            { email: account.email },
            { email: account.email, passwordHash: hashPassword(account.password), museumId: museum._id },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`${account.email} / ${account.password} -> ${museum._id}`);
    }
} catch (error) {
    console.error(`Seed account fallito: ${error.message}`);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
