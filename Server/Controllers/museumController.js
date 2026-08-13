import Museum from "../Models/museum.js";

// ===============================
// OTTIENI CONFIGURAZIONE MUSEO
// ===============================
// Il progetto gestisce un solo museo per installazione: restituiamo sempre il primo documento
export async function getMuseum(req, res) {
    try {
        const museum = await Museum.findOne().populate("visits");
        res.json(museum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ===============================
// CREA O AGGIORNA CONFIGURAZIONE MUSEO
// ===============================
export async function saveMuseum(req, res) {
    try {
        const existing = await Museum.findOne();

        const museum = existing
            ? await Museum.findByIdAndUpdate(existing._id, req.body, { new: true })
            : await Museum.create(req.body);

        res.json(museum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
