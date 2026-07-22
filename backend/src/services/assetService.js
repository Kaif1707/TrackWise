import Asset from "../models/Asset.js";
import { AppError } from "../utils/appError.js";

export const getAssetsByUser = async (userId, query = {}) => {
  const filter = { user: userId };
  if (query.category) {
    filter.category = query.category;
  }
  if (query.search) {
    filter.$or = [
      { symbol: { $regex: query.search, $options: "i" } },
      { name: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.isWatchlist === "true") {
    filter.isWatchlist = true;
  }

  const sort = {};
  if (query.sortBy) {
    const order = query.order === "asc" ? 1 : -1;
    sort[query.sortBy] = order;
  } else {
    sort.createdAt = -1;
  }

  return await Asset.find(filter).sort(sort);
};

export const createAssetForUser = async (userId, assetData) => {
  const existing = await Asset.findOne({ user: userId, symbol: assetData.symbol });
  if (existing) {
    // If asset with same symbol exists, update quantity and avg buy price or throw error
    // For portfolio tracking: update existing asset quantity and recalculate average buy price
    const newQty = existing.qty + assetData.qty;
    const newAvgBuy =
      newQty > 0
        ? (existing.qty * existing.avgBuy + assetData.qty * assetData.avgBuy) / newQty
        : assetData.avgBuy;

    existing.qty = newQty;
    existing.avgBuy = newAvgBuy;
    existing.price = assetData.price || existing.price;
    if (assetData.name) existing.name = assetData.name;
    if (assetData.img) existing.img = assetData.img;
    if (assetData.category) existing.category = assetData.category;
    if (assetData.trend && assetData.trend.length) existing.trend = assetData.trend;

    return await existing.save();
  }

  return await Asset.create({
    ...assetData,
    user: userId,
  });
};

export const updateAssetForUser = async (userId, assetId, updateData) => {
  const asset = await Asset.findOneAndUpdate(
    { _id: assetId, user: userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!asset) {
    throw new AppError("Asset not found or unauthorized", 404);
  }

  return asset;
};

export const deleteAssetForUser = async (userId, assetId) => {
  const asset = await Asset.findOneAndDelete({ _id: assetId, user: userId });

  if (!asset) {
    throw new AppError("Asset not found or unauthorized", 404);
  }

  return { success: true };
};

export const getPortfolioSummaryForUser = async (userId) => {
  const assets = await Asset.find({ user: userId });

  let totalValue = 0;
  let totalInvested = 0;
  const categoryAllocation = {
    stock: 0,
    crypto: 0,
    commodity: 0,
    property: 0,
  };

  assets.forEach((a) => {
    const val = a.qty * a.price;
    const inv = a.qty * a.avgBuy;
    totalValue += val;
    totalInvested += inv;
    if (categoryAllocation[a.category] !== undefined) {
      categoryAllocation[a.category] += val;
    }
  });

  const totalReturn =
    totalInvested > 0
      ? ((totalValue - totalInvested) / totalInvested) * 100
      : 0;

  return {
    totalValue,
    totalInvested,
    totalReturn,
    holdingsCount: assets.length,
    categoryAllocation,
  };
};
