import React, { useMemo, useState } from "react";
import "./Reports.css";
import { Download, BarChart3, PieChart, Calendar } from "lucide-react";
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
import { useAssets } from "../hooks/useAssets";
import { IAsset } from "../types";
import SkeletonLoader from "../components/SkeletonLoader";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

/* ---------------- EXPORT HELPERS ---------------- */

function downloadCSV(assets: IAsset[]) {
  if (!assets.length) return;

  const header = "Symbol,Name,Qty,Avg Buy,LTP,Value,P/L (%)\n";
  const rows = assets
    .map((a) => {
      const value = a.qty * a.price;
      const pl = a.avgBuy ? ((a.price - a.avgBuy) / a.avgBuy) * 100 : 0;
      return `${a.symbol},"${a.name}",${a.qty},${a.avgBuy},${a.price},${value.toFixed(
        2
      )},${pl.toFixed(2)}%`;
    })
    .join("\n");

  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `trackwise_portfolio_report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function downloadPDF(assets: IAsset[]) {
  const doc = new jsPDF();
  let y = 16;

  doc.setFontSize(18);
  doc.text("TrackWise Portfolio Analytics Report", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 12;

  doc.setFontSize(11);

  assets.forEach((a, idx) => {
    const value = a.qty * a.price;
    const pl = a.avgBuy ? ((a.price - a.avgBuy) / a.avgBuy) * 100 : 0;

    doc.text(
      `${idx + 1}. ${a.symbol} (${a.name}) | Qty: ${a.qty} | LTP: $${a.price} | Val: $${value.toFixed(
        2
      )} | P/L: ${pl.toFixed(2)}%`,
      14,
      y
    );
    y += 8;

    if (y > 270) {
      doc.addPage();
      y = 16;
    }
  });

  doc.save(`trackwise_portfolio_report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ---------------- COMPONENT ---------------- */

export default function Reports() {
  const { assets, isLoading } = useAssets();
  const [range, setRange] = useState("monthly");

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
      const pl = a.avgBuy ? ((a.price - a.avgBuy) / a.avgBuy) * 100 : 0;

      invested += inv;
      current += cur;

      const cat = a.category ?? "stock";
      if (allocation[cat] !== undefined) {
        allocation[cat] += cur;
      }

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
          "rgba(78,156,255,0.7)",
          "rgba(255,118,118,0.7)",
          "rgba(255,220,120,0.7)",
          "rgba(180,180,200,0.6)",
        ],
      },
    ],
  };

  const barData = {
    labels: assets.length > 0 ? assets.map((a) => a.symbol) : ["No Data"],
    datasets: [
      {
        label: "Unrealized P/L ($)",
        data: assets.length > 0 ? assets.map((a) => a.qty * (a.price - a.avgBuy)) : [0],
        backgroundColor: assets.map((a) =>
          a.price >= a.avgBuy ? "rgba(126, 231, 135, 0.8)" : "rgba(255, 123, 123, 0.8)"
        ),
      },
    ],
  };

  return (
    <section className="reports-page">
      <div className="reports-header">
        <h1>Reports & Insights</h1>
        <p className="subtitle">Deep financial analysis and portfolio reporting</p>
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
          {isLoading ? (
            <SkeletonLoader height="28px" width="80px" />
          ) : (
            <p className={stats.totalReturn >= 0 ? "number positive" : "number negative"}>
              {stats.totalReturn.toFixed(2)}%
            </p>
          )}
        </div>

        <div className="glass-card rep-card">
          <h3>Total Invested</h3>
          {isLoading ? (
            <SkeletonLoader height="28px" width="100px" />
          ) : (
            <p className="number">${stats.invested.toLocaleString()}</p>
          )}
        </div>

        <div className="glass-card rep-card">
          <h3>Current Value</h3>
          {isLoading ? (
            <SkeletonLoader height="28px" width="100px" />
          ) : (
            <p className="number">${stats.current.toLocaleString()}</p>
          )}
        </div>

        <div className="glass-card rep-card">
          <h3>Best Performer</h3>
          {isLoading ? (
            <SkeletonLoader height="28px" width="120px" />
          ) : (
            <p className="number positive">
              {stats.bestSymbol
                ? `${stats.bestSymbol} (+${stats.bestPl.toFixed(2)}%)`
                : "—"}
            </p>
          )}
        </div>

        <div className="glass-card rep-card">
          <h3>Worst Performer</h3>
          {isLoading ? (
            <SkeletonLoader height="28px" width="120px" />
          ) : (
            <p className="number negative">
              {stats.worstSymbol && stats.worstSymbol !== stats.bestSymbol
                ? `${stats.worstSymbol} (${stats.worstPl.toFixed(2)}%)`
                : "—"}
            </p>
          )}
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
            <BarChart3 size={18} /> Asset Profit/Loss Breakdown
          </h3>
          <Bar data={barData} />
        </div>
      </div>

      <div className="download-row glass-card">
        <h3>
          <Calendar size={18} /> Export Portfolio Statements
        </h3>
        <div className="download-actions">
          <button className="download-btn" onClick={() => downloadCSV(assets)} disabled={assets.length === 0}>
            <Download size={16} /> Download CSV
          </button>
          <button className="download-btn" onClick={() => downloadPDF(assets)} disabled={assets.length === 0}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
    </section>
  );
}
