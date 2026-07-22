import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { IAsset, IPortfolioSummary } from "../types";
import * as assetsApi from "../api/assets";
import { useAuth } from "./AuthContext";

interface AssetContextType {
  assets: IAsset[];
  summary: IPortfolioSummary | null;
  isLoading: boolean;
  error: string | null;
  refreshAssets: () => Promise<void>;
  addAsset: (asset: Omit<IAsset, "_id">) => Promise<IAsset>;
  editAsset: (id: string, asset: Partial<IAsset>) => Promise<IAsset>;
  removeAsset: (id: string) => Promise<void>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<IAsset[]>([]);
  const [summary, setSummary] = useState<IPortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAssets = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedAssets, fetchedSummary] = await Promise.all([
        assetsApi.fetchAssets(),
        assetsApi.fetchPortfolioSummary(),
      ]);
      setAssets(fetchedAssets);
      setSummary(fetchedSummary);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAssets();
    } else {
      setAssets([]);
      setSummary(null);
    }
  }, [isAuthenticated, refreshAssets]);

  const addAsset = async (assetData: Omit<IAsset, "_id">) => {
    const newAsset = await assetsApi.createAsset(assetData);
    await refreshAssets();
    return newAsset;
  };

  const editAsset = async (id: string, assetData: Partial<IAsset>) => {
    const updated = await assetsApi.updateAsset(id, assetData);
    await refreshAssets();
    return updated;
  };

  const removeAsset = async (id: string) => {
    await assetsApi.deleteAsset(id);
    await refreshAssets();
  };

  return (
    <AssetContext.Provider
      value={{
        assets,
        summary,
        isLoading,
        error,
        refreshAssets,
        addAsset,
        editAsset,
        removeAsset,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error("useAssets must be used within an AssetProvider");
  }
  return context;
};
