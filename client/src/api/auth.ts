import { apiClient } from "./client";
import { ICredentials, IRegisterData, IAuthResponse, IUser } from "../types";

export async function login(credentials: ICredentials): Promise<IAuthResponse> {
  const res = await apiClient.post("/auth/login", credentials);
  return res.data.data;
}

export async function register(data: IRegisterData): Promise<IAuthResponse> {
  const res = await apiClient.post("/auth/register", data);
  return res.data.data;
}

export async function getCurrentUser(): Promise<{ user: IUser }> {
  const res = await apiClient.get("/auth/me");
  return res.data.data;
}
