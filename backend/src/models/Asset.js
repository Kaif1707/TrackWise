import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
  symbol: String,
  name: String,
  qty: Number,
  avgBuy: Number,
  price: Number,
  trend: [Number],
  img: String,
  category: {
    type: String,
    enum: ["stock", "crypto", "commodity", "property"]
  }
});

export default mongoose.model("Asset", assetSchema);
