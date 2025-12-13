// src/pages/Dashboard.tsx
import "./Dashboard.css";
import PerformanceChart from "../components/PerformanceChart";
import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, TrendingUp, Clock } from "lucide-react";
import HoldingsTable from "../components/HoldingsTable";
import AddAssetModal from "../components/AddAssetModal";
import ModalPortal from "../components/ModalPortal";
import axios from "axios";

function AnimatedNumber({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = performance.now();
    const from = display;
    const diff = value - from;

    const step = (ts: number) => {
      const t = Math.min(1, (ts - start) / duration);
      setDisplay(Math.round(from + diff * t));
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

export default function Dashboard() {
  const [assets, setAssets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  // Load assets from storage
  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem("assets");
      const arr = raw ? JSON.parse(raw) : [];
      setAssets(arr);
    };

    load();
    window.addEventListener("assets-updated", load);
    return () => window.removeEventListener("assets-updated", load);
  }, []);

  // DYNAMIC METRICS
  const totalValue = assets.reduce((sum, a) => sum + a.qty * a.price, 0);
  const holdingsCount = assets.length;

  const todayProfit = assets.reduce((sum, a) => {
    if (!a.trend || a.trend.length < 2) return sum;
    const diff = a.trend[a.trend.length - 1] - a.trend[a.trend.length - 2];
    return sum + diff * a.qty;
  }, 0);

  const liquidity = Math.max(0, totalValue * 0.12);

  // 🔥 QUICK INSIGHTS (dynamic)
  useEffect(() => {
  async function loadAssets() {
    try {
      const res = await axios.get("http://localhost:5000/api/assets");
      setAssets(res.data);
    } catch (err) {
      console.error("Failed to load assets", err);
    }
  }

  loadAssets();

  window.addEventListener("assets-updated", loadAssets);
  return () => window.removeEventListener("assets-updated", loadAssets);
}, []);


  return (
    <>
      <section className="tw-dashboard-grid">
        <div className="tw-dashboard-header">
          <div className="page-title">Overview</div>
          <div className="page-sub">Your real-time portfolio data</div>
        </div>

        {/* METRIC CARDS */}
        <div className="cards-row">
          <article className="glass-card card-large">
            <div className="card-top">
              <div className="card-title">Total Portfolio Value</div>
              <div className="card-icon"><TrendingUp size={18} /></div>
            </div>
            <div className="card-value">
              $<AnimatedNumber value={totalValue} />
            </div>
          </article>

          <article className="glass-card">
            <div className="card-top">
              <div className="card-title">Today's Profit</div>
              <div className="card-icon"><ArrowUp size={16} /></div>
            </div>
            <div className="card-value accent">
              $<AnimatedNumber value={todayProfit} />
            </div>
          </article>

          <article className="glass-card">
            <div className="card-top">
              <div className="card-title">Holdings</div>
              <div className="card-icon"><Clock size={16} /></div>
            </div>
            <div className="card-value">
              <AnimatedNumber value={holdingsCount} />
            </div>
          </article>

          <article className="glass-card">
            <div className="card-top">
              <div className="card-title">Liquidity</div>
              <div className="card-icon"><ArrowDown size={16} /></div>
            </div>
            <div className="card-value">
              $<AnimatedNumber value={liquidity} />
            </div>
          </article>
        </div>


        {/* PERFORMANCE + INSIGHTS */}
        <div className="performance-row">
          <div className="performance-panel glass-card large-panel">
            <div className="panel-header">
              <div className="panel-title">Portfolio Performance</div>
              <div className="panel-sub">Last 30 days</div>
            </div>
            <div className="chart-area">
              <PerformanceChart assets={assets} />

            </div>
          </div>

          {/* 🔥 DYNAMIC QUICK INSIGHTS */}
          <aside className="insights-panel glass-card small-panel">
  <div className="panel-title">Quick Insights</div>

  {assets.length === 0 ? (
    <p style={{ opacity: 0.7 }}>Add assets to view insights</p>
  ) : (
    (() => {
      // -----------------------------
      // Helper: Calculate % returns
      // -----------------------------
      const calcPLpct = (a: any) =>
        a.avgBuy ? ((a.price - a.avgBuy) / a.avgBuy) * 100 : 0;

      // -----------------------------
      // Determine gainer & loser
      // -----------------------------
      const sorted = [...assets].sort(
        (a, b) => calcPLpct(b) - calcPLpct(a)
      );

      const topGainer = sorted[0];
      const topLoser = sorted[sorted.length - 1];

      // -----------------------------
      // Total portfolio return
      // -----------------------------
      const totalInvested = assets.reduce(
        (sum, a) => sum + a.qty * a.avgBuy,
        0
      );

      const totalCurrent = assets.reduce(
        (sum, a) => sum + a.qty * a.price,
        0
      );

      const totalReturn =
        totalInvested > 0
          ? (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(2)
          : "0";

      return (
        <ul className="insights-list">
          <li>
            Top gainer: <strong>{topGainer.symbol}</strong>{" "}
            <span className="positive">
              (+{calcPLpct(topGainer).toFixed(2)}%)
            </span>
          </li>

          <li>
            Top loser: <strong>{topLoser.symbol}</strong>{" "}
            <span className="negative">
              {calcPLpct(topLoser).toFixed(2)}%
            </span>
          </li>

          <li>
            Portfolio return:{" "}
            <strong
              className={
                Number(totalReturn) >= 0 ? "positive" : "negative"
              }
            >
              {Number(totalReturn) >= 0 ? "+" : ""}
              {totalReturn}%
            </strong>
          </li>
        </ul>
      );
    })()
  )}
</aside>
</div>


        {/* HOLDINGS TABLE */}
        <div className="holdings-row glass-card holdings-panel">
          <div className="holdings-header">
            <div className="holdings-title">Holdings</div>
            <button className="add-asset-btn" onClick={() => setShowModal(true)}>
              + Add Asset
            </button>
          </div>

          <HoldingsTable />
        </div>
      </section>

      {showModal && (
        <ModalPortal>
          <AddAssetModal close={() => setShowModal(false)} />
        </ModalPortal>
      )}
    </>
  );
}
