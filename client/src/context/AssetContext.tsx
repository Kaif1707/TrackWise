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

const DEFAULT_MOCK_ASSETS: IAsset[] = [
  {
    _id: "asset_1",
    symbol: "AAPL",
    name: "Apple Inc.",
    qty: 15,
    avgBuy: 175.5,
    price: 224.2,
    trend: [170, 182, 195, 210, 224.2],
    category: "stock",
  },
  {
    _id: "asset_2",
    symbol: "BTC",
    name: "Bitcoin",
    qty: 0.45,
    avgBuy: 52000,
    price: 64800,
    trend: [50000, 54000, 58000, 61000, 64800],
    category: "crypto",
  },
  {
    _id: "asset_3",
    symbol: "GOLD",
    name: "Gold Spot (Oz)",
    qty: 5,
    avgBuy: 2050,
    price: 2420,
    trend: [2000, 2100, 2250, 2350, 2420],
    category: "commodity",
  },
];

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<IAsset[]>([]);
  const [summary, setSummary] = useState<IPortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSummary = (assetList: IAsset[]): IPortfolioSummary => {
    let totalValue = 0;
    let totalInvested = 0;
    const categoryAllocation = { stock: 0, crypto: 0, commodity: 0, property: 0 };

    assetList.forEach((a) => {
      const val = a.qty * a.price;
      const inv = a.qty * a.avgBuy;
      totalValue += val;
      totalInvested += inv;
      if (a.category && categoryAllocation[a.category] !== undefined) {
        categoryAllocation[a.category] += val;
      }
    });

    const totalReturn =
      totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

    return {
      totalValue,
      totalInvested,
      totalReturn,
      holdingsCount: assetList.length,
      categoryAllocation,
    };
  };

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
      // Offline fallback: load from local storage
      const saved = localStorage.getItem("trackwise_assets");
      const list: IAsset[] = saved ? JSON.parse(saved) : DEFAULT_MOCK_ASSETS;
      setAssets(list);
      setSummary(calculateSummary(list));
      if (!saved) {
        localStorage.setItem("trackwise_assets", JSON.stringify(DEFAULT_MOCK_ASSETS));
      }
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
    try {
      const newAsset = await assetsApi.createAsset(assetData);
      await refreshAssets();
      return newAsset;
    } catch (err: any) {
      // Offline fallback
      const created: IAsset = { ...assetData, _id: "local_" + Date.now() };
      const updated = [created, ...assets];
      setAssets(updated);
      setSummary(calculateSummary(updated));
      localStorage.setItem("trackwise_assets", JSON.stringify(updated));
      return created;
    }
  };

  const editAsset = async (id: string, assetData: Partial<IAsset>) => {
    try {
      const updated = await assetsApi.updateAsset(id, assetData);
      await refreshAssets();
      return updated;
    } catch (err: any) {
      // Offline fallback
      const updatedList = assets.map((a) =>
        a._id === id ? { ...a, ...assetData } : a
      );
      setAssets(updatedList);
      setSummary(calculateSummary(updatedList));
      localStorage.setItem("trackwise_assets", JSON.stringify(updatedList));
      return updatedList.find((a) => a._id === id)!;
    }
  };

  const removeAsset = async (id: string) => {
    try {
      await assetsApi.deleteAsset(id);
      await refreshAssets();
    } catch (err: any) {
      // Offline fallback
      const updatedList = assets.filter((a) => a._id !== id);
      setAssets(updatedList);
      setSummary(calculateSummary(updatedList));
      localStorage.setItem("trackwise_assets", JSON.stringify(updatedList));
    }
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
