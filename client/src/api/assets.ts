import { apiClient } from "./client";
import { IAsset, IPortfolioSummary } from "../types";

export async function fetchAssets(params?: {
  category?: string;
  search?: string;
  isWatchlist?: boolean;
}): Promise<IAsset[]> {
  const res = await apiClient.get("/assets", { params });
  return res.data;
}

export async function fetchPortfolioSummary(): Promise<IPortfolioSummary> {
  const res = await apiClient.get("/assets/summary");
  return res.data;
}

export async function createAsset(asset: Omit<IAsset, "_id">): Promise<IAsset> {
  const res = await apiClient.post("/assets", asset);
  return res.data;
}

export async function updateAsset(
  id: string,
  asset: Partial<IAsset>
): Promise<IAsset> {
  const res = await apiClient.put(`/assets/${id}`, asset);
  return res.data;
}

export async function deleteAsset(id: string): Promise<{ success: boolean }> {
  const res = await apiClient.delete(`/assets/${id}`);
  return res.data;
}
