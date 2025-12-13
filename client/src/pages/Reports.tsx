// src/pages/Reports.tsx
import { useEffect, useMemo, useState } from "react";
import "./Reports.css";
import { Download, BarChart3, PieChart, Calendar } from "lucide-react";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import jsPDF from "jspdf";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

/* ---------------- TYPES ---------------- */

type Asset = {
  symbol: string;
  name: string;
  qty: number;
  avgBuy: number;
  price: number;
  category?: "stock" | "crypto" | "commodity" | "property";
};

/* ---------------- EXPORT HELPERS ---------------- */

function downloadCSV(assets: Asset[]) {
  if (!assets.length) return;

  const header = "Symbol,Name,Qty,Avg Buy,LTP,Value,P/L (%)\n";
  const rows = assets
    .map((a) => {
      const value = a.qty * a.price;
      const pl = ((a.price - a.avgBuy) / a.avgBuy) * 100;
      return `${a.symbol},${a.name},${a.qty},${a.avgBuy},${a.price},${value.toFixed(
        2
      )},${pl.toFixed(2)}%`;
    })
    .join("\n");

  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "portfolio_report.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function downloadPDF(assets: Asset[]) {
  const doc = new jsPDF();
  let y = 12;

  doc.setFontSize(16);
  doc.text("Portfolio Report", 10, y);
  y += 10;

  doc.setFontSize(11);

  assets.forEach((a) => {
    const value = a.qty * a.price;
    const pl = ((a.price - a.avgBuy) / a.avgBuy) * 100;

    doc.text(
      `${a.symbol} | Qty: ${a.qty} | LTP: $${a.price} | Value: $${value.toFixed(
        2
      )} | P/L: ${pl.toFixed(2)}%`,
      10,
      y
    );
    y += 8;

    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save("portfolio_report.pdf");
}

/* ---------------- COMPONENT ---------------- */

export default function Reports() {
  const [range, setRange] = useState("monthly");
  const [assets, setAssets] = useState<Asset[]>([]);

  /* -------- FETCH FROM BACKEND -------- */

  async function loadAssets() {
    try {
      const res = await axios.get("http://localhost:5000/api/assets");
      setAssets(res.data);
    } catch (err) {
      console.error("Failed to load assets for reports", err);
    }
  }

  useEffect(() => {
    loadAssets();

    // refresh when asset added/edited
    window.addEventListener("assets-updated", loadAssets);
    return () =>
      window.removeEventListener("assets-updated", loadAssets);
  }, []);

  /* ---------------- STATS ---------------- */

  const stats = useMemo(() => {
    let invested = 0;
    let current = 0;

    const allocation = {
      stock: 0,
      crypto: 0,
      commodity: 0,
      property: 0,
    };

    let bestSymbol = "";
    let bestPl = -Infinity;

    let worstSymbol = "";
    let worstPl = Infinity;

    assets.forEach((a) => {
      const inv = a.qty * a.avgBuy;
      const cur = a.qty * a.price;
      const pl = ((a.price - a.avgBuy) / a.avgBuy) * 100;

      invested += inv;
      current += cur;

      const cat = a.category ?? "stock";
      allocation[cat] += cur;

      if (pl > bestPl) {
        bestPl = pl;
        bestSymbol = a.symbol;
      }

      if (pl < worstPl) {
        worstPl = pl;
        worstSymbol = a.symbol;
      }
    });

    const totalReturn =
      invested > 0 ? ((current - invested) / invested) * 100 : 0;

    return {
      invested,
      current,
      totalReturn,
      allocation,
      bestSymbol,
      bestPl,
      worstSymbol,
      worstPl,
    };
  }, [assets]);

  /* ---------------- CHART DATA ---------------- */

  const pieData = {
    labels: ["Stocks", "Crypto", "Commodities", "Property"],
    datasets: [
      {
        data: [
          stats.allocation.stock,
          stats.allocation.crypto,
          stats.allocation.commodity,
          stats.allocation.property,
        ],
        backgroundColor: [
          "rgba(78,156,255,0.6)",
          "rgba(255,118,118,0.6)",
          "rgba(255,220,120,0.6)",
          "rgba(180,180,200,0.5)",
        ],
      },
    ],
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Profit / Loss ($)",
        data: assets.map(
          (a) => a.qty * (a.price - a.avgBuy)
        ),
        backgroundColor: "rgba(78,156,255,0.8)",
      },
    ],
  };

  /* ---------------- UI ---------------- */

  return (
    <section className="reports-page">
      <div className="reports-header">
        <h1>Reports & Insights</h1>
        <p className="subtitle">Deep analytics of your portfolio</p>
      </div>

      <div className="report-filter glass-card">
        {["daily", "weekly", "monthly", "yearly"].map((r) => (
          <button
            key={r}
            className={range === r ? "active" : ""}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="report-cards">
        <div className="glass-card rep-card">
          <h3>Total Return</h3>
          <p className={stats.totalReturn >= 0 ? "number positive" : "number negative"}>
            {stats.totalReturn.toFixed(2)}%
          </p>
        </div>

        <div className="glass-card rep-card">
          <h3>Invested</h3>
          <p className="number">${stats.invested.toLocaleString()}</p>
        </div>

        <div className="glass-card rep-card">
          <h3>Current Value</h3>
          <p className="number">${stats.current.toLocaleString()}</p>
        </div>

        <div className="glass-card rep-card">
          <h3>Best Performer</h3>
          <p className="number positive">
            {stats.bestSymbol
              ? `${stats.bestSymbol} (+${stats.bestPl.toFixed(2)}%)`
              : "—"}
          </p>
        </div>

        <div className="glass-card rep-card">
          <h3>Worst Performer</h3>
          <p className="number negative">
            {stats.worstSymbol
              ? `${stats.worstSymbol} (${stats.worstPl.toFixed(2)}%)`
              : "—"}
          </p>
        </div>
      </div>

      <div className="charts-row">
        <div className="glass-card chart-box">
          <h3>
            <PieChart size={18} /> Asset Allocation
          </h3>
          <Pie data={pieData} />
        </div>

        <div className="glass-card chart-box">
          <h3>
            <BarChart3 size={18} /> Profit/Loss Trend
          </h3>
          <Bar data={barData} />
        </div>
      </div>

      <div className="download-row glass-card">
        <h3>
          <Calendar size={18} /> Export Reports
        </h3>
        <div className="download-actions">
          <button className="download-btn" onClick={() => downloadCSV(assets)}>
            <Download size={16} /> Download CSV
          </button>
          <button className="download-btn" onClick={() => downloadPDF(assets)}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
    </section>
  );
}
