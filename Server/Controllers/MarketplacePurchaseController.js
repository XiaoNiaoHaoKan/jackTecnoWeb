import MarketplacePurchase from "../Models/marketplacePurchase.js";

export async function getStaffPurchases(req, res) {
  try {
    const purchases = await MarketplacePurchase.find()
      .sort({ isRead: 1, purchasedAt: -1 })
      .lean();

    res.json(purchases);
  } catch (error) {
    res.status(500).json({
      error: "Impossibile caricare le notifiche degli acquisti.",
    });
  }
}

export async function markPurchaseAsRead(req, res) {
  try {
    const purchase = await MarketplacePurchase.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true },
    );

    if (!purchase) {
      return res.status(404).json({ error: "Notifica non trovata." });
    }

    return res.json(purchase);
  } catch (error) {
    return res.status(500).json({
      error: "Impossibile aggiornare la notifica.",
    });
  }
}
