import { asyncHandler } from "../utils/asyncHandler.js";
import * as assetService from "../services/assetService.js";

export const getAssets = asyncHandler(async (req, res) => {
  const assets = await assetService.getAssetsByUser(req.user.id, req.query);
  res.status(200).json(assets);
});

export const addAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.createAssetForUser(req.user.id, req.body);
  res.status(201).json(asset);
});

export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await assetService.updateAssetForUser(
    req.user.id,
    req.params.id,
    req.body
  );
  res.status(200).json(asset);
});

export const deleteAsset = asyncHandler(async (req, res) => {
  await assetService.deleteAssetForUser(req.user.id, req.params.id);
  res.status(200).json({ success: true });
});

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await assetService.getPortfolioSummaryForUser(req.user.id);
  res.status(200).json(summary);
});
