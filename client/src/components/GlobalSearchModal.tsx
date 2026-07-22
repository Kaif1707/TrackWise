import React, { useEffect, useState, useRef } from "react";
import { Search, ArrowRight, LayoutDashboard, BarChart3, PieChart, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAssets } from "../hooks/useAssets";
import { useCurrency } from "../hooks/useCurrency";
import "./GlobalSearchModal.css";

export default function GlobalSearchModal({ close }: { close: () => void }) {
  const navigate = useNavigate();
  const { assets } = useAssets();
  const { formatAmount } = useCurrency();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  const navItems = [
    { label: "Overview Dashboard", path: "/", icon: <LayoutDashboard size={16} /> },
    { label: "Financial Reports & Exports", path: "/reports", icon: <BarChart3 size={16} /> },
    { label: "Portfolio Analytics", path: "/analytics", icon: <PieChart size={16} /> },
    { label: "Platform Preferences & Settings", path: "/settings", icon: <Settings size={16} /> },
  ];

  const filteredAssets = assets.filter((a) => {
    const q = query.toLowerCase().trim();
    if (!q) return false;
    return a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
  });

  const filteredPages = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase().trim())
  );

  return (
    <div className="search-backdrop" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="search-modal-box">
        <div className="search-input-header">
          <Search size={20} className="search-icon" />
          <input
            ref={inputRef}
            placeholder="Search assets (e.g. BTC, AAPL), or navigate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="esc-kbd">ESC</kbd>
        </div>

        <div className="search-results-content">
          {/* Quick Navigation Pages */}
          {filteredPages.length > 0 && (
            <div className="search-section">
              <span className="search-section-title">Navigation Quick Links</span>
              <div className="search-list">
                {filteredPages.map((page) => (
                  <div
                    key={page.path}
                    className="search-item"
                    onClick={() => {
                      navigate(page.path);
                      close();
                    }}
                  >
                    <div className="search-item-left">
                      {page.icon}
                      <span>{page.label}</span>
                    </div>
                    <ArrowRight size={14} className="arrow-icon" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Asset Search Results */}
          {query.trim() && (
            <div className="search-section">
              <span className="search-section-title">Matching Portfolio Assets ({filteredAssets.length})</span>
              {filteredAssets.length > 0 ? (
                <div className="search-list">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset._id || asset.symbol}
                      className="search-item"
                      onClick={() => {
                        navigate("/");
                        close();
                      }}
                    >
                      <div className="search-item-left">
                        <div className="search-asset-symbol">{asset.symbol}</div>
                        <div className="search-asset-info">
                          <span className="name">{asset.name}</span>
                          <span className="category">{asset.category?.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="search-item-right">
                        <span className="price">{formatAmount(asset.price)}</span>
                        <span className="qty">{asset.qty} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-search">No matching asset holdings found</div>
              )}
            </div>
          )}

          {!query.trim() && filteredPages.length === 0 && (
            <div className="empty-search">Type a symbol or page name to search...</div>
          )}
        </div>
      </div>
    </div>
  );
}
