export type AssetCategory = "stock" | "crypto" | "commodity" | "property";

export interface IAsset {
  _id?: string;
  symbol: string;
  name: string;
  qty: number;
  avgBuy: number;
  price: number;
  trend?: number[];
  img?: string;
  category?: AssetCategory;
  isWatchlist?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}

export interface IPortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  holdingsCount: number;
  categoryAllocation: {
    stock: number;
    crypto: number;
    commodity: number;
    property: number;
  };
}

export interface IApiResponse<T> {
  status: "success" | "fail" | "error";
  data?: T;
  message?: string;
}

export interface ICredentials {
  email: string;
  password: string;
}

export interface IRegisterData {
  name: string;
  email: string;
  password: string;
}
