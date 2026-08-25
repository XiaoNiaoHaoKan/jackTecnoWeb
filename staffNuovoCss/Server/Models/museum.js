import mongoose from "mongoose";

// Definizione della struttura del museo (curatore -> configurazione generica)
const museumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String },
    description: { type: String },

    rooms: [
        {
            name: { type: String, required: true },
            description: { type: String, default: "" }
        }
    ],

    // visite selezionate/proposte per questo museo
    visits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Visit" }]

}, { timestamps: true });

export default mongoose.model("Museum", museumSchema);
