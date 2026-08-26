import mongoose from "mongoose";

const marketplacePurchaseSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["item", "visit"],
            required: true
        },

        itemId: {
            type: String,
            default: ""
        },

        visitId: {
            type: String,
            default: ""
        },

        buyerUsername: {
            type: String,
            required: true
        },

        sellerUsername: {
            type: String,
            default: ""
        },

        price: {
            type: Number,
            default: 0
        },

        itemTitle: {
            type: String,
            default: ""
        },

        itemData: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        purchasedAt: {
            type: Date,
            default: Date.now
        },

        isRead: {
            type: Boolean,
            default: false
        },

        readAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        collection: "marketplace_purchases"
    }
);

export default mongoose.model(
    "MarketplacePurchase",
    marketplacePurchaseSchema
);