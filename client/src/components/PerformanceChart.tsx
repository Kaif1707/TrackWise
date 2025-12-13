// src/components/PerformanceChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Asset = {
  qty: number;
  price: number;
};

export default function PerformanceChart({ assets }: { assets: Asset[] }) {

  if (!assets || assets.length === 0) {
    return (
      <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
        No performance data available
      </div>
    );
  }

  // Current total portfolio value
  const total = assets.reduce((sum, a) => sum + a.qty * a.price, 0);

  // Build a small dynamic trend (simulated history)
  const data = [
    { month: "Jan", value: total * 0.85 },
    { month: "Feb", value: total * 0.90 },
    { month: "Mar", value: total * 0.93 },
    { month: "Apr", value: total * 0.96 },
    { month: "May", value: total * 0.98 },
    { month: "Jun", value: total },
  ];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ left: 10, right: 10, top: 20 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" stroke="var(--text)" tick={{ fontSize: 12 }} />
          <YAxis stroke="var(--text)" tick={{ fontSize: 12 }} />

          <Tooltip
            contentStyle={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--text)" }}
            itemStyle={{ color: "var(--text)" }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#4e9cff"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
