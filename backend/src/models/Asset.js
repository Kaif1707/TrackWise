import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Asset must belong to a user"],
      index: true,
    },
    symbol: {
      type: String,
      required: [true, "Symbol is required"],
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    qty: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    avgBuy: {
      type: Number,
      required: [true, "Average buy price is required"],
      min: [0, "Average buy price cannot be negative"],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    trend: {
      type: [Number],
      default: [],
    },
    img: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: {
        values: ["stock", "crypto", "commodity", "property"],
        message: "Category must be stock, crypto, commodity, or property",
      },
      default: "stock",
      lowercase: true,
      trim: true,
    },
    isWatchlist: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup by user and category/symbol
assetSchema.index({ user: 1, symbol: 1 });
assetSchema.index({ user: 1, category: 1 });

export default mongoose.model("Asset", assetSchema);
