import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { auth as apiAuth, setToken, clearToken, getToken } from "@/lib/api";
import type { AppRole, Profile } from "@/types/database";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clusterId?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  role: AppRole | null;
  /** True only during the initial session-restore check on app mount */
  loading: boolean;
  /** True while a login / register / token-refresh operation is in flight */
  isLoading: boolean;
  /** Last auth error message, cleared by clearError() or on next attempt */
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  /** Re-validate the stored token against /auth/me (called automatically on mount) */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function normalizeRole(rawRole: unknown): AppRole | null {
  const role = String(rawRole || '').trim().toUpperCase();
  if (!role) return null;
  if (role === 'CLUSTER_ADMIN' || role === 'ADMIN') return 'admin';
  if (role === 'FIELD_MANAGER' || role === 'FIELDMANAGER') return 'fieldmanager';
  if (role === 'LAND_OWNER' || role === 'LANDOWNER') return 'landowner';
  if (role === 'EXPERT') return 'expert';
  if (role === 'WORKER' || role === 'USER') return 'worker';
  return null;
}

/** Map raw API / network error messages to user-friendly strings */
function categorizeAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  const lower = msg.toLowerCase();

  if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('networkerror')) {
    return 'Network error — please check your connection and try again.';
  }
  if (lower.includes('deactivated') || lower.includes('disabled') || lower.includes('inactive')) {
    return 'Your account has been deactivated. Please contact your administrator.';
  }
  if (
    lower.includes('invalid') ||
    lower.includes('credentials') ||
    lower.includes('unauthorized') ||
    lower.includes('401') ||
    lower.includes('bad credentials') ||
    lower.includes('wrong password') ||
    lower.includes('not found')
  ) {
    return 'Invalid email or password. Please try again.';
  }
  if (lower.includes('500') || lower.includes('server error') || lower.includes('internal')) {
    return 'Server error — please try again in a moment.';
  }
  if (lower.includes('already exists') || lower.includes('duplicate') || lower.includes('conflict')) {
    return 'An account with this email already exists.';
  }
  if (msg) return msg;
  return 'An unexpected error occurred. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  /** Initial session-restore loading flag */
  const [loading, setLoading] = useState(true);
  /** In-flight auth operation flag */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setRole(null);
      return;
    }
    try {
      const u = await apiAuth.me();
      console.log('[AuthContext] Session restored — role:', u.role);
      const normRole = normalizeRole(u.role);
      setUser(u);
      setRole(normRole);
    } catch {
      // Token is invalid or expired — clear it silently
      clearToken();
      setUser(null);
      setRole(null);
    }
  }, []);

  // Restore session from localStorage on app mount
  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiAuth.login(email, password);
      console.log('[AuthContext] Login — backend role:', res.user.role);
      const normRole = normalizeRole(res.user.role);
      console.log('[AuthContext] Login — normalized role:', normRole);
      setToken(res.token);
      setUser(res.user);
      setRole(normRole);
    } catch (err) {
      const friendly = categorizeAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, rawRole: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiAuth.register(email, password, name, rawRole);
      setToken(res.token);
      setUser(res.user);
      setRole(normalizeRole(res.user.role));
    } catch (err) {
      const friendly = categorizeAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setRole(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile: null,
      isAuthenticated: !!user,
      role,
      loading,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
