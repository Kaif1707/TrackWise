import React, { useState, useMemo } from "react";
import "./Dashboard.css";
import PerformanceChart from "../components/PerformanceChart";
import { ArrowUp, ArrowDown, TrendingUp, Clock, Target, Star } from "lucide-react";
import HoldingsTable from "../components/HoldingsTable";
import AddAssetModal from "../components/AddAssetModal";
import ModalPortal from "../components/ModalPortal";
import SkeletonLoader from "../components/SkeletonLoader";
import { useAssets } from "../hooks/useAssets";
import { useCurrency } from "../hooks/useCurrency";

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
  }, [value, duration]);

  return <span>{display.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>;
}

export default function Dashboard() {
  const { assets, isLoading, summary } = useAssets();
  const { formatAmount, currencyConfig } = useCurrency();
  const [showModal, setShowModal] = useState(false);

  // Target Goal Milestone from LocalStorage
  const targetGoal = useMemo(() => {
    const saved = localStorage.getItem("trackwise_target_goal");
    return saved ? Number(saved) : 100000;
  }, []);

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

  const goalProgress = useMemo(() => {
    const pct = Math.min(100, (metrics.totalValue / targetGoal) * 100);
    return Math.max(0, pct);
  }, [metrics.totalValue, targetGoal]);

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
          <div>
            <h1 className="page-title">Portfolio Overview</h1>
            <p className="page-sub">Real-time performance metrics and asset distribution in {currencyConfig.code}</p>
          </div>
        </div>

        {/* METRIC CARDS */}
        <div className="cards-row">
          <article className="glass-card card-large">
            <div className="card-top">
              <span className="card-title">Total Portfolio Value</span>
              <div className="card-icon"><TrendingUp size={18} /></div>
            </div>
            <div className="card-value">
              {isLoading ? (
                <SkeletonLoader height="36px" width="140px" />
              ) : (
                formatAmount(metrics.totalValue)
              )}
            </div>
            <div className="card-badge-row">
              <span className={`badge-tag ${Number(insights?.totalReturn || 0) >= 0 ? "positive" : "negative"}`}>
                {Number(insights?.totalReturn || 0) >= 0 ? "▲ +" : "▼ "}
                {insights?.totalReturn || "0"}%
              </span>
              <span className="badge-sub">All-time portfolio return</span>
            </div>
          </article>

          <article className="glass-card">
            <div className="card-top">
              <span className="card-title">Today's Profit / Loss</span>
              <div className="card-icon"><ArrowUp size={16} /></div>
            </div>
            <div className="card-value accent">
              {isLoading ? (
                <SkeletonLoader height="32px" width="100px" />
              ) : (
                formatAmount(metrics.todayProfit)
              )}
            </div>
            <div className="card-badge-row">
              <span className="badge-sub">Estimated 24h market move</span>
            </div>
          </article>

          <article className="glass-card">
            <div className="card-top">
              <span className="card-title">Active Holdings</span>
              <div className="card-icon"><Clock size={16} /></div>
            </div>
            <div className="card-value">
              {isLoading ? (
                <SkeletonLoader height="32px" width="60px" />
              ) : (
                <AnimatedNumber value={metrics.holdingsCount} />
              )}
            </div>
            <div className="card-badge-row">
              <span className="badge-sub">Diversified across categories</span>
            </div>
          </article>

          <article className="glass-card">
            <div className="card-top">
              <span className="card-title">Liquidity Allocation</span>
              <div className="card-icon"><ArrowDown size={16} /></div>
            </div>
            <div className="card-value">
              {isLoading ? (
                <SkeletonLoader height="32px" width="100px" />
              ) : (
                formatAmount(metrics.liquidity)
              )}
            </div>
            <div className="card-badge-row">
              <span className="badge-sub">Cash buffer & reserve</span>
            </div>
          </article>
        </div>

        {/* PORTFOLIO GOAL MILESTONE WIDGET */}
        <div className="glass-card goal-widget-card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="card-icon" style={{ background: "rgba(16, 185, 129, 0.12)", color: "var(--success)" }}>
                <Target size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Portfolio Milestone Goal Progress
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Target Goal: {formatAmount(targetGoal)}
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--success)" }}>
                {goalProgress.toFixed(1)}% Completed
              </span>
            </div>
          </div>
          <div style={{ width: "100%", height: "10px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "999px", overflow: "hidden" }}>
            <div
              style={{
                width: `${goalProgress}%`,
                height: "100%",
                background: "var(--accent-gradient)",
                borderRadius: "999px",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* PERFORMANCE + INSIGHTS */}
        <div className="performance-row">
          <div className="performance-panel glass-card large-panel">
            <div className="panel-header">
              <div className="panel-title">Portfolio Historical Trend</div>
              <div className="panel-sub">30-Day Value trajectory</div>
            </div>
            <div className="chart-area">
              <PerformanceChart assets={assets} />
            </div>
          </div>

          {/* DYNAMIC QUICK INSIGHTS */}
          <aside className="insights-panel glass-card small-panel">
            <div className="panel-title">Asset Rank Insights</div>

            {isLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                <SkeletonLoader height="24px" />
                <SkeletonLoader height="24px" />
                <SkeletonLoader height="24px" />
              </div>
            ) : !insights ? (
              <p style={{ opacity: 0.7, marginTop: 12 }}>Add assets to view real-time portfolio insights</p>
            ) : (
              <div className="insights-list">
                <div className="insights-item">
                  <div className="insights-item-left">
                    <div className="insights-rank-badge gainer">#1</div>
                    <span className="insights-label">Top Gainer</span>
                  </div>
                  <div className="insights-value positive">
                    {insights.topGainer.symbol} (+{insights.topGainerPct.toFixed(2)}%)
                  </div>
                </div>

                <div className="insights-item">
                  <div className="insights-item-left">
                    <div className="insights-rank-badge loser">#L</div>
                    <span className="insights-label">Top Loser</span>
                  </div>
                  <div className="insights-value negative">
                    {insights.topLoser.symbol} ({insights.topLoserPct.toFixed(2)}%)
                  </div>
                </div>

                <div className="insights-item">
                  <div className="insights-item-left">
                    <span className="insights-label">Total Return</span>
                  </div>
                  <div className={`insights-value ${Number(insights.totalReturn) >= 0 ? "positive" : "negative"}`}>
                    {Number(insights.totalReturn) >= 0 ? "+" : ""}
                    {insights.totalReturn}%
                  </div>
                </div>
              </div>
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
