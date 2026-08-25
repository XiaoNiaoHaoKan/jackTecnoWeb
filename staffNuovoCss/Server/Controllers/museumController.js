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
        const museum = await Museum
            .findById(req.user.museumId._id)
            .populate({
                path: "visits",
                select: "title synchronized"
            });

        if (!museum) {
            return res.status(404).json({
                error: "Museo non trovato"
            });
        }

        const payload = {
            type: "artaroud-museum",
            version: 1,
            museum: {
                id: museum._id.toString(),
                name: museum.name,
                city: museum.city || "",
                description: museum.description || "",

                rooms: museum.rooms.map(room => ({
                    name: room.name,
                    description: room.description || ""
                })),

                visits: museum.visits.map(visit => ({
                    id: visit._id.toString(),
                    title: visit.title,
                    synchronized: visit.synchronized
                }))
            }
        };

        const payloadText = JSON.stringify(payload);

        const qrCode = await QRCode.toDataURL(payloadText, {
            errorCorrectionLevel: "M",
            width: 420,
            margin: 2,
            color: {
                dark: "#17324d",
                light: "#fffdf9"
            }
        });

        res.json({
            qrCode,
            payload
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}