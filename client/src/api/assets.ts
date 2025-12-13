import axios from "axios";
import { API_BASE } from "./config";

export async function fetchAssets() {
  const res = await axios.get(`${API_BASE}/assets`);
  return res.data;
}

export async function createAsset(asset: any) {
  const res = await axios.post(`${API_BASE}/assets`, asset);
  return res.data;
}

export async function updateAsset(id: string, asset: any) {
  const res = await axios.put(`${API_BASE}/assets/${id}`, asset);
  return res.data;
}

export async function deleteAsset(id: string) {
  const res = await axios.delete(`${API_BASE}/assets/${id}`);
  return res.data;
}
