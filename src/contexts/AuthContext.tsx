import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { javaApi } from "@/integrations/java-api/client";
import type { AppRole } from "@/types/database";

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  isAuthenticated: boolean;
  role: AppRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (sessionUser: any) => {
    if (!sessionUser) {
      setUser(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setUser(sessionUser);

    try {
      const [roleResponse, profileResponse] = await Promise.all([
        javaApi.select('user_roles', { eq: { user_id: sessionUser.id } }),
        javaApi.select('profiles', { eq: { id: sessionUser.id } }),
      ]);

      // Fall back to role on the user object if user_roles table has no entry
      const roleData = roleResponse.success && roleResponse.data && (roleResponse.data as any[]).length > 0
        ? (roleResponse.data as any[])[0]?.role
        : (sessionUser.role ?? null);
      const profileData = profileResponse.success && profileResponse.data && (profileResponse.data as any[]).length > 0
        ? (profileResponse.data as any[])[0]
        : null;

      setRole(roleData ?? null);
      setProfile(profileData as Profile | null);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Still set role from user object if available
      setRole(sessionUser.role ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check if user is already logged in (token in localStorage)
    const token = localStorage.getItem('javaApiToken');
    if (token) {
      // Fetch current user from backend
      javaApi.getCurrentUser().then(response => {
        if (response.success && response.data) {
          fetchUserData((response.data as any).user ?? (response.data as any));
        } else {
          setLoading(false);
        }
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> => {
    const response = await javaApi.auth.signInWithPassword(email, password);
    if (response.success && response.data) {
      const userData = (response.data as any).user ?? response.data;
      await fetchUserData(userData);
      return { success: true, role: userData.role as string };
    }
    return { success: false, error: response.error };
  };

  const logout = async () => {
    await javaApi.signOut();
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
