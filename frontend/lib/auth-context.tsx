"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { setCookie, getCookie, deleteCookie } from "./cookies";

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = getCookie("pcos_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        console.warn("Invalid user data in cookie");
      }
    }
  }, []);

  function login(token: string, user: User) {
    setCookie("pcos_token", token, 7);
    setCookie("pcos_user", JSON.stringify(user), 7);
    setUser(user);
  }

  function logout() {
    deleteCookie("pcos_token");
    deleteCookie("pcos_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
