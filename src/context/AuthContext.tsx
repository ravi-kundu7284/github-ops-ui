import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchAuthStatus,
  fetchHealth,
  fetchRateLimit,
  getBaseUrl as getApiBaseUrl,
  getStoredApiKey,
  getStoredToken,
  setBaseUrl as setApiBaseUrl,
  setStoredApiKey,
  setStoredToken,
} from '../api/client';
import { GitHubUser, HealthStatus, RateLimitData } from '../types/github';

interface AuthContextValue {
  user: GitHubUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendHealth: HealthStatus | null;
  rateLimit: RateLimitData | null;
  token: string;
  apiKey: string;
  baseUrl: string;
  updateToken: (newToken: string) => Promise<void>;
  updateApiKey: (newKey: string) => void;
  updateBaseUrl: (newUrl: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitData | null>(null);
  const [token, setToken] = useState<string>(getStoredToken());
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [baseUrl, setBaseUrlState] = useState<string>(getApiBaseUrl());

  const checkConnectionAndAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check health
      try {
        const health = await fetchHealth();
        setBackendHealth(health);
      } catch {
        setBackendHealth(null);
      }

      // 2. Check auth
      try {
        const authData = await fetchAuthStatus();
        setIsAuthenticated(authData.authenticated);
        setUser(authData.user);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }

      // 3. Check rate limit if authenticated or connected
      try {
        const rl = await fetchRateLimit();
        setRateLimit(rl);
      } catch {
        setRateLimit(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnectionAndAuth();
  }, [checkConnectionAndAuth]);

  const updateToken = async (newToken: string) => {
    setStoredToken(newToken);
    setToken(newToken);
    await checkConnectionAndAuth();
  };

  const updateApiKey = (newKey: string) => {
    setStoredApiKey(newKey);
    setApiKey(newKey);
  };

  const updateBaseUrl = async (newUrl: string) => {
    setApiBaseUrl(newUrl);
    setBaseUrlState(newUrl);
    await checkConnectionAndAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        backendHealth,
        rateLimit,
        token,
        apiKey,
        baseUrl,
        updateToken,
        updateApiKey,
        updateBaseUrl,
        refreshAuth: checkConnectionAndAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
