// src/api/commodities.ts
// Unified commodity API using GoldAPI.io

const API_KEY = "goldapi-167cjlsmilf8c7l-io";

// Map app symbols → GoldAPI asset codes
const SYMBOL_MAP: Record<string, string> = {
  GOLD: "XAU",
  SILVER: "XAG",

  // Oils
  OIL: "WTI",
  WTI: "WTI",
  BRENT: "BRENT",

  // Natural Gas
  GAS: "NG",
  NATGAS: "NG",
};

export async function fetchCommodityPrice(symbol: string): Promise<number | null> {
  try {
    const metal = SYMBOL_MAP[symbol.toUpperCase()];
    if (!metal) {
      console.warn("Unknown commodity:", symbol);
      return null;
    }

    const url = `https://www.goldapi.io/api/${metal}/USD`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-access-token": API_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (data?.price) {
      return Number(data.price);
    }

    console.error("GoldAPI commodity error:", data);
    return null;
  } catch (err) {
    console.error("Commodity API Error:", err);
    return null;
  }
}
