import Museum from "../Models/museum.js";
import QRCode from "qrcode";

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

// ===============================
// GENERA QR DEL MUSEO
// ===============================
export async function getMuseumQr(req, res) {
    try {
        const museum = await Museum.findById(req.user.museumId._id);

        if (!museum) {
            return res.status(404).json({
                error: "Museo non trovato"
            });
        }

        // Questi sono gli unici dati inseriti realmente nel QR.
        const payload = {
            type: "artaroud-museum",
            version: 1,
            museumId: museum._id.toString()
        };

        const qrCode = await QRCode.toDataURL(
            JSON.stringify(payload),
            {
                errorCorrectionLevel: "M",
                width: 420,
                margin: 2,
                color: {
                    dark: "#17324d",
                    light: "#fffdf9"
                }
            }
        );

        res.json({
            qrCode,
            payload,

            // Serve solo all'interfaccia e non viene inserito nel QR.
            museumName: museum.name
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}