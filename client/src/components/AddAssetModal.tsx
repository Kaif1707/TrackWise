// src/components/AddAssetModal.tsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { fetchCryptoPriceUSD } from "../api/crypto";
import "./AddAssetModal.css";

type AssetShape = {
  _id?: string;
  symbol: string;
  name: string;
  qty: number;
  avgBuy: number;
  price: number;
  trend: number[];
  img?: string;
  category: "stock" | "crypto" | "commodity" | "property";
};

export default function AddAssetModal({
  initial,
  close,
}: {
  initial?: Partial<AssetShape>;
  close: () => void;
}) {
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

  // -------------------------------------------------------------
  // 🔥 AUTO FETCH LOGIC ONLY IF PRICE EMPTY
  // -------------------------------------------------------------
  async function getLivePrice(symbol: string, category: string) {
    if (form.price.trim() !== "") return Number(form.price); // already entered

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

  // -------------------------------------------------------------
  // 🔥 SUBMIT (ADD or EDIT)
  // -------------------------------------------------------------
  async function handleSubmit() {
    const symbol = form.symbol.trim().toUpperCase();
    const name = form.name.trim() || symbol;
    const qty = Number(form.qty);
    const avgBuy = Number(form.avgBuy);
    let price = Number(form.price);
    const category = form.category as AssetShape["category"];

    // Fetch live price if needed
    const auto = await getLivePrice(symbol, category);
    if (auto && auto > 0) price = auto;

    if (!price || price <= 0) price = avgBuy;

    // Build trend
    const trend = initial?.trend
      ? [...initial.trend.slice(-5), price] // extend existing trend
      : Array(5).fill(avgBuy).concat([price]);

    const asset: AssetShape = {
      _id: form._id,
      symbol,
      name,
      qty,
      avgBuy,
      price,
      trend,
      img: "/mnt/data/sample.png",
      category,
    };

    try {
      // UPDATE
      if (asset._id) {
        await axios.put(`http://localhost:5000/api/assets/${asset._id}`, asset);
      }

      // CREATE
      else {
        await axios.post("http://localhost:5000/api/assets", asset);
      }

      window.dispatchEvent(new Event("assets-updated"));
    } catch (err) {
      console.error("Save failed:", err);
    }

    close();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) close();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-box">
        <h2>{form._id ? "Edit Asset" : "Add Asset"}</h2>

        <input
          ref={firstInputRef}
          placeholder="Symbol (e.g. BTC, AAPL)"
          value={form.symbol}
          onChange={(e) => update("symbol", e.target.value.toUpperCase())}
        />

        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number"
            placeholder="Quantity"
            value={form.qty}
            onChange={(e) => update("qty", e.target.value)}
          />
          <input
            type="number"
            placeholder="Avg Buy"
            value={form.avgBuy}
            onChange={(e) => update("avgBuy", e.target.value)}
          />
        </div>

        <input
          type="number"
          placeholder="Price (leave empty for auto)"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
        />

        {loadingPrice && (
          <div style={{ opacity: 0.7, marginTop: -4, fontSize: "0.85rem" }}>
            Fetching live price...
          </div>
        )}

        <label style={{ marginTop: 6, display: "block" }}>
          Category:
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="stock">Stock</option>
            <option value="crypto">Crypto</option>
            <option value="commodity">Commodity</option>
            <option value="property">Property</option>
          </select>
        </label>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={close}>
            Cancel
          </button>

          <button className="save-btn" onClick={handleSubmit}>
            {form._id ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
