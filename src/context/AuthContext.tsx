/**
 * Authentication & Backend Connection Context.
 *
 * This context coordinates global authentication state, token storage, backend health monitoring,
 * and rate limit status across all application views and components.
 */
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

/**
 * Value exposed to consumers of AuthContext.
 */
interface AuthContextValue {
  /** The currently authenticated GitHub user profile, or null if unauthenticated */
  user: GitHubUser | null;
  /** Boolean indicating whether a valid GitHub token is connected */
  isAuthenticated: boolean;
  /** True when diagnostic checks or login validation are in-flight */
  isLoading: boolean;
  /** Diagnostic health report returned by the FastAPI backend (/health) */
  backendHealth: HealthStatus | null;
  /** Active GitHub API quota numbers (remaining, limit, reset timestamp) */
  rateLimit: RateLimitData | null;
  /** The active GitHub token string (stored in browser memory/localStorage) */
  token: string;
  /** Optional backend API key sent via X-API-Key */
  apiKey: string;
  /** The base URL of the FastAPI backend */
  baseUrl: string;
  /** Update the active GitHub token and trigger a connection test */
  updateToken: (newToken: string) => Promise<void>;
  /** Update the backend API key */
  updateApiKey: (newKey: string) => void;
  /** Change the backend base URL (e.g. switching between local and Cloud Run) */
  updateBaseUrl: (newUrl: string) => Promise<void>;
  /** Manually refresh connection health, user profile, and rate limit status */
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Global authentication and connection provider component.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitData | null>(null);
  const [token, setToken] = useState<string>(getStoredToken());
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [baseUrl, setBaseUrlState] = useState<string>(getApiBaseUrl());

  /**
   * Diagnostic probe:
   * 1. Pings FastAPI backend (/health) to verify server is reachable.
   * 2. Tests GitHub authentication (/api/auth/status) to verify token validity.
   * 3. Fetches live rate limits (/api/auth/ratelimit) to update quota badges.
   */
  const checkConnectionAndAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // Step 1: Probe backend server health
      try {
        const health = await fetchHealth();
        setBackendHealth(health);
      } catch {
        setBackendHealth(null);
      }

      // Step 2: Probe GitHub user authentication status
      try {
        const authData = await fetchAuthStatus();
        setIsAuthenticated(authData.authenticated);
        setUser(authData.user);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }

      // Step 3: Fetch current rate limit status
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

  // Run initial diagnostic check on mount
  useEffect(() => {
    checkConnectionAndAuth();
  }, [checkConnectionAndAuth]);

  /**
   * Update GitHub Personal Access Token in localStorage and re-verify connectivity.
   */
  const updateToken = async (newToken: string) => {
    setStoredToken(newToken);
    setToken(newToken);
    await checkConnectionAndAuth();
  };

  /**
   * Update backend API key in localStorage.
   */
  const updateApiKey = (newKey: string) => {
    setStoredApiKey(newKey);
    setApiKey(newKey);
  };

  /**
   * Update backend URL and re-verify connectivity.
   */
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

/**
 * Custom hook to access authentication and backend status.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
