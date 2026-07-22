import React, { useState, useMemo } from "react";
import "./Dashboard.css";
import PerformanceChart from "../components/PerformanceChart";
import { ArrowUp, ArrowDown, TrendingUp, Clock } from "lucide-react";
import HoldingsTable from "../components/HoldingsTable";
import AddAssetModal from "../components/AddAssetModal";
import ModalPortal from "../components/ModalPortal";
import SkeletonLoader from "../components/SkeletonLoader";
import { useAssets } from "../hooks/useAssets";

function AnimatedNumber({ value, duration = 900 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  React.useEffect(() => {
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

  return <span>{display.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>;
}

export default function Dashboard() {
  const { assets, isLoading, summary } = useAssets();
  const [showModal, setShowModal] = useState(false);

  // Dynamic calculations memoized for performance
  const metrics = useMemo(() => {
    const totalVal = summary?.totalValue ?? assets.reduce((sum, a) => sum + a.qty * a.price, 0);
    const count = summary?.holdingsCount ?? assets.length;

    const todayProf = assets.reduce((sum, a) => {
      if (!a.trend || a.trend.length < 2) return sum;
      const diff = a.trend[a.trend.length - 1] - a.trend[a.trend.length - 2];
      return sum + diff * a.qty;
    }, 0);

    const liq = Math.max(0, totalVal * 0.12);

    return {
      totalValue: totalVal,
      holdingsCount: count,
      todayProfit: todayProf,
      liquidity: liq,
    };
  }, [assets, summary]);

  const insights = useMemo(() => {
    if (!assets || assets.length === 0) return null;

    const calcPLpct = (a: any) =>
      a.avgBuy ? ((a.price - a.avgBuy) / a.avgBuy) * 100 : 0;

    const sorted = [...assets].sort((a, b) => calcPLpct(b) - calcPLpct(a));
    const topGainer = sorted[0];
    const topLoser = sorted[sorted.length - 1];

    const totalInvested = assets.reduce((sum, a) => sum + a.qty * a.avgBuy, 0);
    const totalCurrent = assets.reduce((sum, a) => sum + a.qty * a.price, 0);

    const totalReturn =
      totalInvested > 0
        ? (((totalCurrent - totalInvested) / totalInvested) * 100).toFixed(2)
        : "0";

    return {
      topGainer,
      topGainerPct: calcPLpct(topGainer),
      topLoser,
      topLoserPct: calcPLpct(topLoser),
      totalReturn,
    };
  }, [assets]);

  return (
    <>
      <section className="tw-dashboard-grid">
        <div className="tw-dashboard-header">
          <div className="page-title">Overview</div>
          <div className="page-sub">Real-time performance metrics and asset distribution</div>
        </div>

        {/* METRIC CARDS */}
        <div className="cards-row">
          <article className="glass-card card-large">
            <div className="card-top">
              <div className="card-title">Total Portfolio Value</div>
              <div className="card-icon"><TrendingUp size={18} /></div>
            </div>
            <div className="card-value">
              {isLoading ? <SkeletonLoader height="36px" width="140px" /> : <>$<AnimatedNumber value={metrics.totalValue} /></>}
            </div>
          </article>

          <article className="glass-card">
            <div className="card-top">
              <div className="card-title">Today's Profit</div>
              <div className="card-icon"><ArrowUp size={16} /></div>
            </div>
            <div className="card-value accent">
              {isLoading ? <SkeletonLoader height="32px" width="100px" /> : <>$<AnimatedNumber value={metrics.todayProfit} /></>}
            </div>
          </article>

          <article className="glass-card">
            <div className="card-top">
              <div className="card-title">Holdings</div>
              <div className="card-icon"><Clock size={16} /></div>
            </div>
            <div className="card-value">
              {isLoading ? <SkeletonLoader height="32px" width="60px" /> : <AnimatedNumber value={metrics.holdingsCount} />}
            </div>
          </article>

          <article className="glass-card">
            <div className="card-top">
              <div className="card-title">Liquidity</div>
              <div className="card-icon"><ArrowDown size={16} /></div>
            </div>
            <div className="card-value">
              {isLoading ? <SkeletonLoader height="32px" width="100px" /> : <>$<AnimatedNumber value={metrics.liquidity} /></>}
            </div>
          </article>
        </div>

        {/* PERFORMANCE + INSIGHTS */}
        <div className="performance-row">
          <div className="performance-panel glass-card large-panel">
            <div className="panel-header">
              <div className="panel-title">Portfolio Performance</div>
              <div className="panel-sub">Historical trend snapshot</div>
            </div>
            <div className="chart-area">
              <PerformanceChart assets={assets} />
            </div>
          </div>

          {/* DYNAMIC QUICK INSIGHTS */}
          <aside className="insights-panel glass-card small-panel">
            <div className="panel-title">Quick Insights</div>

            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                <SkeletonLoader height="20px" />
                <SkeletonLoader height="20px" />
                <SkeletonLoader height="20px" />
              </div>
            ) : !insights ? (
              <p style={{ opacity: 0.7, marginTop: 12 }}>Add assets to view real-time portfolio insights</p>
            ) : (
              <ul className="insights-list">
                <li>
                  Top gainer: <strong>{insights.topGainer.symbol}</strong>{" "}
                  <span className="positive">
                    (+{insights.topGainerPct.toFixed(2)}%)
                  </span>
                </li>

                <li>
                  Top loser: <strong>{insights.topLoser.symbol}</strong>{" "}
                  <span className="negative">
                    {insights.topLoserPct.toFixed(2)}%
                  </span>
                </li>

                <li>
                  Portfolio return:{" "}
                  <strong
                    className={
                      Number(insights.totalReturn) >= 0 ? "positive" : "negative"
                    }
                  >
                    {Number(insights.totalReturn) >= 0 ? "+" : ""}
                    {insights.totalReturn}%
                  </strong>
                </li>
              </ul>
            )}
          </aside>
        </div>

        {/* HOLDINGS TABLE */}
        <div className="holdings-row glass-card holdings-panel">
          <div className="holdings-header">
            <div className="holdings-title">Asset Allocation & Holdings</div>
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
