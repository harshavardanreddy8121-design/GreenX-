import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

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
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiAuth.login(email, password);
    console.log('[AuthContext] Backend user.role (login):', res.user.role);
    const normRole = normalizeRole(res.user.role);
    console.log('[AuthContext] Normalized role (login):', normRole);
    setToken(res.token);
    setUser(res.user);
    setRole(normRole);
  };

  const register = async (email: string, password: string, name: string, rawRole: string) => {
    const res = await apiAuth.register(email, password, name, rawRole);
    setToken(res.token);
    setUser(res.user);
    setRole(normalizeRole(res.user.role));
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile: null,
      isAuthenticated: !!user,
      role,
      loading,
      login,
      register,
      logout,
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
