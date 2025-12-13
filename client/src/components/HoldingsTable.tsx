// src/components/HoldingsTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./HoldingsTable.css";
import axios from "axios";
import {
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
} from "lucide-react";
import AddAssetModal from "./AddAssetModal";

type Holding = {
  _id?: string;
  symbol: string;
  name: string;
  qty: number;
  avgBuy: number;
  price: number;
  trend?: number[];
  img?: string;
  category?: "stock" | "crypto" | "commodity" | "property";
};

export default function HoldingsTable({
  initialSort = { key: "value", dir: "desc" as "asc" | "desc" },
}: {
  initialSort?: { key: string; dir: "asc" | "desc" };
}) {
  const [q, setQ] = useState("");
  const [assets, setAssets] = useState<Holding[]>([]);
  const [sortKey, setSortKey] = useState(initialSort.key);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initialSort.dir);

  const [editing, setEditing] = useState<Holding | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ----------------------------------------------------
  // 🔥 Load assets from backend
  // ----------------------------------------------------
  async function loadAssets() {
    try {
      const res = await axios.get("http://localhost:5000/api/assets");
      setAssets(res.data);
    } catch (err) {
      console.error("Failed to load assets:", err);
    }
  }

  useEffect(() => {
    loadAssets();
  }, []);

  // ----------------------------------------------------
  // DELETE
  // ----------------------------------------------------
  async function handleDelete(id?: string) {
    if (!id) return;
    if (!confirm("Delete this asset?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/assets/${id}`);
      loadAssets();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  function handleEdit(asset: Holding) {
    setEditing(asset);
    setShowModal(true);
  }

  // ----------------------------------------------------
  // SORTING
  // ----------------------------------------------------
  function toggleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  // ----------------------------------------------------
  // COMPUTE & SORT ROWS
  // ----------------------------------------------------
  const rows = useMemo(() => {
    const mapped = assets.map((r) => {
      const value = r.qty * r.price;
      const plPct = r.avgBuy ? ((r.price - r.avgBuy) / r.avgBuy) * 100 : 0;
      return { ...r, value, plPct };
    });

    const filtered = mapped.filter((r) => {
      const ql = q.toLowerCase();
      return (
        r.symbol.toLowerCase().includes(ql) ||
        r.name.toLowerCase().includes(ql)
      );
    });

    return filtered.sort((a, b) => {
      const A: any = (a as any)[sortKey] ?? 0;
      const B: any = (b as any)[sortKey] ?? 0;

      if (typeof A === "string")
        return sortDir === "asc" ? A.localeCompare(B) : B.localeCompare(A);

      return sortDir === "asc" ? A - B : B - A;
    });
  }, [assets, q, sortKey, sortDir]);

  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------
  return (
    <div className="holdings-table-panel glass-card">
      <div className="ht-header">
        <div className="ht-title">Holdings</div>

        <div className="ht-actions">
          <input
            className="ht-search"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="ht-total">Total: ${totalValue.toLocaleString()}</div>
        </div>
      </div>

      <div className="ht-table-wrapper">
        <table className="ht-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("symbol")}>Symbol</th>
              <th>Name</th>
              <th>Qty</th>
              <th>Avg Buy</th>
              <th>LTP</th>
              <th>P/L %</th>
              <th>Value</th>
              <th>Trend</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td className="td-symbol">
                  <img src={r.img} className="symbol-thumb" />
                  <div>
                    <div className="sym">{r.symbol}</div>
                    <div className="sym-sub">{r.name}</div>
                  </div>
                </td>

                <td>{r.name}</td>
                <td>{r.qty}</td>
                <td>${r.avgBuy.toLocaleString()}</td>
                <td>${r.price.toLocaleString()}</td>

                <td>
                  <div className={`pl ${r.plPct >= 0 ? "pos" : "neg"}`}>
                    {r.plPct >= 0 ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    <span>{r.plPct.toFixed(2)}%</span>
                  </div>
                </td>

                <td>${r.value.toLocaleString()}</td>

                <td>
                  <svg width={80} height={28}>
                    <polyline
                      fill="none"
                      stroke={r.plPct >= 0 ? "#7EE787" : "#FF7B7B"}
                      strokeWidth={2}
                      points={(r.trend || [])
                        .map((v, i) => `${i * 15},${28 - (v / (r.price || 1)) * 20}`)
                        .join(" ")}
                    ></polyline>
                  </svg>
                </td>

                <td>
                  <button className="action-btn" onClick={() => handleEdit(r)}>
                    <Edit2 size={16} />
                  </button>

                  <button
                    className="action-btn danger"
                    onClick={() => handleDelete(r._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 24, opacity: 0.7 }}>
                  No holdings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddAssetModal
          initial={editing ?? undefined}
          close={() => {
            setShowModal(false);
            setEditing(null);
            loadAssets(); // 🔥 refresh after saving
          }}
        />
      )}
    </div>
  );
}
