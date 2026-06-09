import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { auth as apiAuth, setToken, clearToken, getToken } from "@/lib/api";
import type { AppRole, Profile } from "@/types/database";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clusterId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  role: AppRole | null;
  loading: boolean;
  /** True while a login/register/refresh call is in-flight */
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeRole(rawRole: unknown): AppRole | null {
  const role = String(rawRole || '').trim().toUpperCase();
  if (!role) return null;
  if (role === 'CLUSTER_ADMIN' || role === 'ADMIN') return 'admin';
  if (role === 'FIELD_MANAGER' || role === 'FIELDMANAGER') return 'fieldmanager';
  if (role === 'LAND_OWNER' || role === 'LANDOWNER') return 'landowner';
  if (role === 'EXPERT') return 'expert';
  if (role === 'WORKER' || role === 'USER') return 'worker';
  return null;
}

/**
 * Maps raw error messages from the backend into user-friendly strings.
 */
function categorizeAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err || '');
  const lower = msg.toLowerCase();
  if (
    lower.includes('401') ||
    lower.includes('invalid') ||
    lower.includes('credentials') ||
    lower.includes('unauthorized') ||
    lower.includes('bad credentials')
  ) {
    return 'Invalid email or password. Please try again.';
  }
  if (lower.includes('not found') || lower.includes('no user')) {
    return 'No account found with that email address.';
  }
  if (lower.includes('disabled') || lower.includes('inactive')) {
    return 'Your account has been disabled. Please contact support.';
  }
  if (
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('failed to fetch') ||
    lower.includes('load failed')
  ) {
    return 'Network error — unable to reach the server. Please check your connection.';
  }
  if (lower.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  if (lower.includes('already') || lower.includes('exists') || lower.includes('duplicate')) {
    return 'An account with this email already exists.';
  }
  return msg || 'An unexpected error occurred. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  /** True while the initial session check is running on mount */
  const [loading, setLoading] = useState(true);
  /** True while a login / register / refreshSession call is in-flight */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    apiAuth.me()
      .then(u => {
        console.log('[AuthContext] Backend user.role:', u.role);
        const normRole = normalizeRole(u.role);
        console.log('[AuthContext] Normalized role:', normRole);
        setUser(u);
        setRole(normRole);
      })
      .catch(() => {
        clearToken();
        setUser(null);
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiAuth.login(email, password);
      console.log('[AuthContext] Backend user.role (login):', res.user.role);
      const normRole = normalizeRole(res.user.role);
      console.log('[AuthContext] Normalized role (login):', normRole);
      setToken(res.token);
      setUser(res.user);
      setRole(normRole);
    } catch (err: unknown) {
      const message = categorizeAuthError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, rawRole: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiAuth.register(email, password, name, rawRole);
      setToken(res.token);
      setUser(res.user);
      setRole(normalizeRole(res.user.role));
    } catch (err: unknown) {
      const message = categorizeAuthError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Re-validates the stored token against the backend and refreshes the
   * in-memory user/role state.  Call this after a long idle period or when
   * you suspect the session may have changed.
   */
  const refreshSession = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setIsLoading(true);
    try {
      const u = await apiAuth.me();
      const normRole = normalizeRole(u.role);
      setUser(u);
      setRole(normRole);
    } catch {
      clearToken();
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setRole(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

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
