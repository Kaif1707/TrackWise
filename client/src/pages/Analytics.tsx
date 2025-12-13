import { useEffect, useState, useMemo } from "react";
import "./Analytics.css";
import axios from "axios";
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
  const [assets, setAssets] = useState<any[]>([]);

  async function loadAssets() {
    try {
      const res = await axios.get("http://localhost:5000/api/assets");
      setAssets(res.data);
    } catch (err) {
      console.error("Analytics fetch failed:", err);
    }
  }

  useEffect(() => {
    loadAssets();
    window.addEventListener("assets-updated", loadAssets);

    return () =>
      window.removeEventListener("assets-updated", loadAssets);
  }, []);

  const totalValue = assets.reduce(
    (sum, a) => sum + a.qty * a.price,
    0
  );

  const { best, worst } = useMemo(() => {
    if (!assets.length) return { best: null, worst: null };

    const calcPL = (a: any) =>
      ((a.price - a.avgBuy) / a.avgBuy) * 100;

    const sorted = [...assets].sort(
      (a, b) => calcPL(b) - calcPL(a)
    );

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
        label: "Portfolio Share",
        data: assets.map((a) => a.qty * a.price),
        backgroundColor: ["#4e9cff", "#7EE787", "#ff7979", "#f1c40f", "#a29bfe"],
        borderColor: "rgba(255,255,255,0.2)",
      },
    ],
  };

  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Portfolio Growth",
        data: [
          totalValue * 0.75,
          totalValue * 0.8,
          totalValue * 0.9,
          totalValue * 1.0,
          totalValue * 1.05,
          totalValue,
        ],
        borderColor: "#4e9cff",
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="analytics-page">
      <h1 className="an-title">Analytics</h1>
      <p className="an-sub">Detailed insights into your portfolio</p>

      <div className="an-cards">
        <div className="an-card">
          <h3>Total Portfolio</h3>
          <p>${totalValue.toLocaleString()}</p>
        </div>

        <div className="an-card">
          <h3>Best Performer</h3>
          {best ? (
            <>
              <p>{best.symbol}</p>
              <span className="green">+{best.pl.toFixed(2)}%</span>
            </>
          ) : (
            <p>No data</p>
          )}
        </div>

        <div className="an-card">
          <h3>Worst Performer</h3>
          {worst ? (
            <>
              <p>{worst.symbol}</p>
              <span className="red">{worst.pl.toFixed(2)}%</span>
            </>
          ) : (
            <p>No data</p>
          )}
        </div>
      </div>

      <div className="an-charts">
        <div className="chart-container glass">
          <h3>Portfolio Distribution</h3>
          {assets.length ? <Pie data={pieData} /> : <p>No assets</p>}
        </div>

        <div className="chart-container glass">
          <h3>Portfolio Growth</h3>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}
