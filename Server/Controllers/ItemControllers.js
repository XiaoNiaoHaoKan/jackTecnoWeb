import Item from "../Models/items.js";

// ===============================
// CREA ITEM
// ===============================
export async function createItem(req, res) {
    try {
        //dati sono mandati dal frontend e salvati nel DB
        const item = await Item.create({ ...req.body, museumId: req.user.museumId._id.toString() });

        //ritorna l’item creato
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// ===============================
// GET TUTTI GLI ITEM
// ===============================
export async function getItems(req, res) {
    try {
        const items = await Item.find({ museumId: req.user.museumId._id.toString() }); //find prende i documenti
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// ===============================
// GET ITEM PER ID
// ===============================
export async function getItemById(req, res) {
    try {
        const item = await Item.findOne({ _id: req.params.id, museumId: req.user.museumId._id.toString() });

        if (!item) {
            return res.status(404).json({ message: "Item non trovato" });
        }

        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// ===============================
// UPDATE ITEM
// ===============================
export async function updateItem(req, res) {
    try {
        const item = await Item.findOneAndUpdate(
            { _id: req.params.id, museumId: req.user.museumId._id.toString() },
            { ...req.body, museumId: req.user.museumId._id.toString() },

            //restituisce item aggiornato
            { new: true }
        );

        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// ===============================
// DELETE ITEM
// ===============================
export async function deleteItem(req, res) {
    try {
        await Item.findOneAndDelete({ _id: req.params.id, museumId: req.user.museumId._id.toString() });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
