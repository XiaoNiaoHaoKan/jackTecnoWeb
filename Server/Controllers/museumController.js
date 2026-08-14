import Museum from "../Models/museum.js";

// ===============================
// OTTIENI CONFIGURAZIONE MUSEO
// ===============================
export async function getMuseum(req, res) {
    try {
        const museum = await Museum.findById(req.user.museumId._id).populate("visits");
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
        const existing = await Museum.findById(req.user.museumId._id);

        const museum = existing
            ? await Museum.findByIdAndUpdate(existing._id, req.body, { new: true })
            : await Museum.create({ ...req.body, _id: req.user.museumId._id });

        res.json(museum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
