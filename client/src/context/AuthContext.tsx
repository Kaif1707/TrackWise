import React, { createContext, useContext, useState, useEffect } from "react";
import { IUser, ICredentials, IRegisterData } from "../types";
import * as authApi from "../api/auth";

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: ICredentials) => Promise<void>;
  register: (data: IRegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const saved = localStorage.getItem("trackwise_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("trackwise_token");
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await authApi.getCurrentUser();
          setUser(res.user);
          localStorage.setItem("trackwise_user", JSON.stringify(res.user));
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    }
    verifySession();
  }, [token]);

  const handleLogin = async (credentials: ICredentials) => {
    const res = await authApi.login(credentials);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("trackwise_token", res.token);
    localStorage.setItem("trackwise_user", JSON.stringify(res.user));
  };

  const handleRegister = async (data: IRegisterData) => {
    const res = await authApi.register(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("trackwise_token", res.token);
    localStorage.setItem("trackwise_user", JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("trackwise_token");
    localStorage.removeItem("trackwise_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
