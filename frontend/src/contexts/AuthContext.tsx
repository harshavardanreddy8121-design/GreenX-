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
  // AUTH DISABLED - Provide mock user data
  const [user, setUser] = useState<AuthUser | null>({
    id: 'test-user-123',
    email: 'test@greenx.com',
    name: 'Test User',
    role: 'ADMIN'
  });
  const [role, setRole] = useState<AppRole | null>('admin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // AUTH DISABLED - Skip token check, use mock data
    setLoading(false);
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
      profile: {
        id: 'test-profile-123',
        full_name: 'Test User',
        role: 'admin' as AppRole,
        email: 'test@greenx.com',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
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
