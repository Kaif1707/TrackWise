import React, { useMemo, useState } from "react";
import "./HoldingsTable.css";
import {
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Star,
} from "lucide-react";
import AddAssetModal from "./AddAssetModal";
import SkeletonLoader from "./SkeletonLoader";
import { useAssets } from "../hooks/useAssets";
import { useCurrency } from "../hooks/useCurrency";
import { IAsset } from "../types";

export default function HoldingsTable({
  initialSort = { key: "value", dir: "desc" as "asc" | "desc" },
}: {
  initialSort?: { key: string; dir: "asc" | "desc" };
}) {
  const { assets, isLoading, removeAsset, editAsset } = useAssets();
  const { formatAmount } = useCurrency();

  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [watchlistOnly, setWatchlistOnly] = useState<boolean>(false);
  const [sortKey, setSortKey] = useState(initialSort.key);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initialSort.dir);

  const [editing, setEditing] = useState<IAsset | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function handleDelete(id?: string) {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this asset from your portfolio?")) return;
    await removeAsset(id);
  }

  async function toggleWatchlist(asset: IAsset) {
    if (!asset._id) return;
    await editAsset(asset._id, { isWatchlist: !asset.isWatchlist });
  }

  function handleEdit(asset: IAsset) {
    setEditing(asset);
    setShowModal(true);
  }

  function toggleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const rows = useMemo(() => {
    const mapped = assets.map((r) => {
      const value = r.qty * r.price;
      const plPct = r.avgBuy ? ((r.price - r.avgBuy) / r.avgBuy) * 100 : 0;
      return { ...r, value, plPct };
    });

    const filtered = mapped.filter((r) => {
      const ql = q.toLowerCase();
      const matchesSearch =
        r.symbol.toLowerCase().includes(ql) ||
        r.name.toLowerCase().includes(ql);
      const matchesCategory =
        selectedCategory === "all" || r.category === selectedCategory;
      const matchesWatchlist = !watchlistOnly || r.isWatchlist;
      return matchesSearch && matchesCategory && matchesWatchlist;
    });

    return filtered.sort((a, b) => {
      const A: any = (a as any)[sortKey] ?? 0;
      const B: any = (b as any)[sortKey] ?? 0;

      if (typeof A === "string")
        return sortDir === "asc" ? A.localeCompare(B) : B.localeCompare(A);

      return sortDir === "asc" ? A - B : B - A;
    });
  }, [assets, q, selectedCategory, watchlistOnly, sortKey, sortDir]);

  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="holdings-table-panel glass-card">
      <div className="ht-header">
        <div className="ht-title">Holdings Overview</div>

        <div className="ht-actions" style={{ gap: "12px", alignItems: "center" }}>
          {/* Watchlist Filter Toggle */}
          <button
            className={`action-btn ${watchlistOnly ? "active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 14px",
              borderRadius: "12px",
              background: watchlistOnly ? "rgba(245, 158, 11, 0.15)" : undefined,
              borderColor: watchlistOnly ? "var(--warning)" : undefined,
              color: watchlistOnly ? "var(--warning)" : undefined,
            }}
            onClick={() => setWatchlistOnly((prev) => !prev)}
            title="Toggle Watchlist Only"
          >
            <Star size={16} fill={watchlistOnly ? "var(--warning)" : "none"} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Watchlist Only</span>
          </button>

          {/* Category Filter */}
          <select
            className="ht-search"
            style={{ width: "auto", cursor: "pointer" }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="stock">Stocks</option>
            <option value="crypto">Crypto</option>
            <option value="commodity">Commodities</option>
            <option value="property">Property</option>
          </select>

          {/* Search Input */}
          <input
            className="ht-search"
            placeholder="Search by name or symbol..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="ht-total">Filtered Total: {formatAmount(totalValue)}</div>
        </div>
      </div>

      <div className="ht-table-wrapper">
        <table className="ht-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}></th>
              <th onClick={() => toggleSort("symbol")} style={{ cursor: "pointer" }}>
                Symbol {sortKey === "symbol" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th>Name</th>
              <th onClick={() => toggleSort("qty")} style={{ cursor: "pointer" }}>
                Qty {sortKey === "qty" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => toggleSort("avgBuy")} style={{ cursor: "pointer" }}>
                Avg Buy {sortKey === "avgBuy" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => toggleSort("price")} style={{ cursor: "pointer" }}>
                LTP {sortKey === "price" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => toggleSort("plPct")} style={{ cursor: "pointer" }}>
                P/L % {sortKey === "plPct" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => toggleSort("value")} style={{ cursor: "pointer" }}>
                Value {sortKey === "value" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th>Trend</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan={10} style={{ padding: "12px 24px" }}>
                    <SkeletonLoader height="28px" />
                  </td>
                </tr>
              ))
            ) : rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r._id}>
                  <td>
                    <button
                      className="action-btn"
                      style={{ border: "none", padding: "4px" }}
                      onClick={() => toggleWatchlist(r)}
                      title={r.isWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                      <Star
                        size={16}
                        color={r.isWatchlist ? "var(--warning)" : "var(--text-muted)"}
                        fill={r.isWatchlist ? "var(--warning)" : "none"}
                      />
                    </button>
                  </td>

                  <td className="td-symbol">
                    {r.img ? (
                      <img src={r.img} className="symbol-thumb" alt={r.symbol} />
                    ) : (
                      <div className="symbol-thumb-fallback">{r.symbol[0]}</div>
                    )}
                    <div>
                      <div className="sym">{r.symbol}</div>
                      <div className="sym-sub">{r.category?.toUpperCase()}</div>
                    </div>
                  </td>

                  <td>{r.name}</td>
                  <td>{r.qty}</td>
                  <td>{formatAmount(r.avgBuy)}</td>
                  <td>{formatAmount(r.price)}</td>

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

                  <td>{formatAmount(r.value)}</td>

                  <td>
                    <svg width={80} height={28}>
                      <polyline
                        fill="none"
                        stroke={r.plPct >= 0 ? "var(--success)" : "var(--danger)"}
                        strokeWidth={2}
                        points={(r.trend || [r.avgBuy, r.price])
                          .map((v, i) => `${i * 15},${28 - (v / (r.price || 1)) * 20}`)
                          .join(" ")}
                      />
                    </svg>
                  </td>

                  <td>
                    <button
                      className="action-btn"
                      onClick={() => handleEdit(r)}
                      title="Edit Asset"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      className="action-btn danger"
                      onClick={() => handleDelete(r._id)}
                      title="Delete Asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} style={{ padding: 32, textAlign: "center", opacity: 0.7 }}>
                  No asset holdings found matching criteria. Click <strong>+ Add Asset</strong> to start tracking!
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
          }}
        />
      )}
    </div>
  );
}
