import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import type { SafeUser } from "@shared/schema";
import { setAuthToken, clearAuthToken, getAuthToken } from "./queryClient";

interface MfaResponse {
  requiresMfa: boolean;
  userId?: string;
}

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<MfaResponse | void>;
  verifyMfa: (userId: string, code: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        clearAuthToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      clearAuthToken();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username: string, password: string): Promise<MfaResponse | void> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Login failed");
    }

    const data = await response.json();

    if (data.requiresMfa) {
      return { requiresMfa: true, userId: data.userId };
    }

    if (data.token) {
      setAuthToken(data.token);
    }
    setUser(data.user);
    setLocation("/portal");
  }

  async function verifyMfa(userId: string, code: string): Promise<void> {
    const response = await fetch("/api/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, code }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "MFA verification failed");
    }

    const data = await response.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    setUser(data.user);
    setLocation("/portal");
  }

  async function register(username: string, password: string) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Registration failed");
    }

    const data = await response.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    setUser(data.user);
    setLocation("/portal");
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    clearAuthToken();
    setUser(null);
    setLocation("/");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, verifyMfa, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
