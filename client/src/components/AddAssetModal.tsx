import React, { useEffect, useRef, useState } from "react";
import { fetchCryptoPriceUSD } from "../api/crypto";
import { useAssets } from "../hooks/useAssets";
import { IAsset, AssetCategory } from "../types";
import "./AddAssetModal.css";

export default function AddAssetModal({
  initial,
  close,
}: {
  initial?: Partial<IAsset>;
  close: () => void;
}) {
  const { addAsset, editAsset } = useAssets();

  const [form, setForm] = useState({
    symbol: initial?.symbol ?? "",
    name: initial?.name ?? "",
    qty: initial?.qty?.toString() ?? "",
    avgBuy: initial?.avgBuy?.toString() ?? "",
    price: initial?.price?.toString() ?? "",
    category: (initial?.category as string) ?? "stock",
    _id: initial?._id ?? undefined,
  });

  const [loadingPrice, setLoadingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => firstInputRef.current?.focus(), []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [close]);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function getLivePrice(symbol: string, category: string) {
    if (form.price.trim() !== "") return Number(form.price);

    let fetched = null;

    if (category === "crypto") {
      setLoadingPrice(true);
      fetched = await fetchCryptoPriceUSD(symbol);
      setLoadingPrice(false);
    }

    if (category === "stock") {
      setLoadingPrice(true);
      const { fetchStockPrice } = await import("../api/stocks");
      fetched = await fetchStockPrice(symbol);
      setLoadingPrice(false);
    }

    if (category === "commodity") {
      const { fetchCommodityPrice } = await import("../api/commodities");
      fetched = await fetchCommodityPrice(symbol);
    }

    return fetched ?? null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const symbol = form.symbol.trim().toUpperCase();
    const name = form.name.trim() || symbol;
    const qty = Number(form.qty);
    const avgBuy = Number(form.avgBuy);
    let price = Number(form.price);
    const category = form.category as AssetCategory;

    if (!symbol) {
      setError("Asset symbol is required");
      return;
    }

    setSubmitting(true);
    try {
      const auto = await getLivePrice(symbol, category);
      if (auto && auto > 0) price = auto;
      if (!price || price <= 0) price = avgBuy;

      const trend = initial?.trend
        ? [...initial.trend.slice(-5), price]
        : Array(5).fill(avgBuy).concat([price]);

      const payload = {
        symbol,
        name,
        qty,
        avgBuy,
        price,
        trend,
        category,
        img: initial?.img || "",
      };

      if (form._id) {
        await editAsset(form._id, payload);
      } else {
        await addAsset(payload);
      }

      close();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save asset");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) close();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-box">
        <h2>{form._id ? "Edit Asset" : "Add Asset"}</h2>

        {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            ref={firstInputRef}
            placeholder="Symbol (e.g. BTC, AAPL)"
            value={form.symbol}
            onChange={(e) => update("symbol", e.target.value.toUpperCase())}
            disabled={submitting}
            required
          />

          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            disabled={submitting}
            required
          />

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Quantity"
              value={form.qty}
              onChange={(e) => update("qty", e.target.value)}
              disabled={submitting}
              required
            />
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Avg Buy"
              value={form.avgBuy}
              onChange={(e) => update("avgBuy", e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <input
            type="number"
            step="any"
            min="0"
            placeholder="Price (leave empty for auto)"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            disabled={submitting}
          />

          {loadingPrice && (
            <div style={{ opacity: 0.7, marginTop: -4, fontSize: "0.85rem" }}>
              Fetching live market price...
            </div>
          )}

          <label style={{ marginTop: 6, display: "block" }}>
            Category:
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              disabled={submitting}
              style={{ marginLeft: 8 }}
            >
              <option value="stock">Stock</option>
              <option value="crypto">Crypto</option>
              <option value="commodity">Commodity</option>
              <option value="property">Property</option>
            </select>
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={close}
              disabled={submitting}
            >
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={submitting}>
              {submitting ? "Saving..." : form._id ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
