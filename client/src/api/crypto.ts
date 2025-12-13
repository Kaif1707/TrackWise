// src/api/crypto.ts

const API = "https://api.coingecko.com/api/v3/simple/price";

/**
 * Fetch price of a crypto in USD
 */
export async function fetchCryptoPriceUSD(symbol: string): Promise<number> {
  try {
    const res = await fetch(`${API}?ids=${symbol}&vs_currencies=usd`);
    const data = await res.json();

    const key = symbol.toLowerCase();
    return data[key]?.usd ?? 0;
  } catch (err) {
    console.error("Crypto price fetch error:", err);
    return 0;
  }
}
