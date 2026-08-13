import mongoose from "mongoose";

//Definizione degli item del database.
const itemSchema = new mongoose.Schema({
    museumId: { type: String, required: true },
    objectId: { type: String, required: true }, // identificatore univoco dell'oggetto museale (stesso per tutte le varianti/testi)

    title: { type: String, required: true },
    text: { type: String, required: true },

    duration: { type: Number, required: true },      // 3s, 15s, 40s...
    languageLevel: { type: String, required: true }, // infantile, medio... (livello di profondità del contenuto)

    author: { type: String, required: true },
    license: { type: String, required: true },

    price: { type: Number, required: true, default: 0 },

    // immagine usata per riconoscere l'oggetto (condivisa tra le varianti dello stesso objectId)
    recognitionImage: { type: String, default: "" },

    // contenuto opzionale: da usare solo se rimane tempo o su richiesta dei visitatori
    optional: { type: Boolean, default: false },

    room: { type: String },
    
    tags: [String],

    /*per la compatibilità a wikidata*/
    externalId: { type: String } // es: Q12345 (Wikidata)
    
}, { timestamps: true });

export default mongoose.model("Item", itemSchema);

