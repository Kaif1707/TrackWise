// src/api/stocks.ts
const API_KEY = "C0X5JS8VPO2G4EIK"; 

export async function fetchStockPrice(symbol: string): Promise<number | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("STOCK API RESPONSE:", data);

    const price = data?.["Global Quote"]?.["05. price"];

    if (!price) return null;

    return Number(price);
  } catch (e) {
    console.error("Stock price API error:", e);
    return null;
  }
}
