import React, { useMemo } from "react";
import "./Analytics.css";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { useAssets } from "../hooks/useAssets";
import { useCurrency } from "../hooks/useCurrency";
import SkeletonLoader from "../components/SkeletonLoader";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function Analytics() {
  const { assets, isLoading, summary } = useAssets();
  const { formatAmount, currencyConfig } = useCurrency();

  const totalValue = useMemo(() => {
    return summary?.totalValue ?? assets.reduce((sum, a) => sum + a.qty * a.price, 0);
  }, [assets, summary]);

  const { best, worst } = useMemo(() => {
    if (!assets.length) return { best: null, worst: null };

    const calcPL = (a: any) =>
      a.avgBuy ? ((a.price - a.avgBuy) / a.avgBuy) * 100 : 0;

    const sorted = [...assets].sort((a, b) => calcPL(b) - calcPL(a));

    return {
      best: { ...sorted[0], pl: calcPL(sorted[0]) },
      worst: {
        ...sorted[sorted.length - 1],
        pl: calcPL(sorted[sorted.length - 1]),
      },
    };
  }, [assets]);

  const pieData = {
    labels: assets.map((a) => a.symbol),
    datasets: [
      {
        label: `Holding Value (${currencyConfig.symbol})`,
        data: assets.map((a) => a.qty * a.price),
        backgroundColor: [
          "#6366f1",
          "#10b981",
          "#ef4444",
          "#f59e0b",
          "#8b5cf6",
          "#ec4899",
          "#3b82f6",
        ],
        borderColor: "rgba(255,255,255,0.2)",
      },
    ],
  };

  const lineData = {
    labels: ["6M Ago", "5M Ago", "4M Ago", "3M Ago", "1M Ago", "Current"],
    datasets: [
      {
        label: `Portfolio Valuation (${currencyConfig.symbol})`,
        data: [
          totalValue * 0.75,
          totalValue * 0.8,
          totalValue * 0.88,
          totalValue * 0.94,
          totalValue * 0.98,
          totalValue,
        ],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1 className="an-title">Portfolio Analytics</h1>
        <p className="an-sub">Deep performance insights and valuation trends in {currencyConfig.code}</p>
      </div>

      <div className="an-cards">
        <div className="an-card glass-card">
          <h3>Total Valuation</h3>
          {isLoading ? <SkeletonLoader height="28px" width="100px" /> : <p>{formatAmount(totalValue)}</p>}
        </div>

        <div className="an-card glass-card">
          <h3>Top Gainer</h3>
          {isLoading ? (
            <SkeletonLoader height="28px" width="120px" />
          ) : best ? (
            <>
              <p>{best.symbol}</p>
              <span className="green">+{best.pl.toFixed(2)}%</span>
            </>
          ) : (
            <p>—</p>
          )}
        </div>

        <div className="an-card glass-card">
          <h3>Worst Performer</h3>
          {isLoading ? (
            <SkeletonLoader height="28px" width="120px" />
          ) : worst ? (
            <>
              <p>{worst.symbol}</p>
              <span className="red">{worst.pl.toFixed(2)}%</span>
            </>
          ) : (
            <p>—</p>
          )}
        </div>
      </div>

      <div className="an-charts">
        <div className="chart-container glass-card">
          <h3>Asset Weight Distribution</h3>
          {assets.length ? <Pie data={pieData} /> : <p style={{ opacity: 0.7, padding: 20 }}>No holdings added</p>}
        </div>

        <div className="chart-container glass-card">
          <h3>Portfolio Growth Trajectory</h3>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}
