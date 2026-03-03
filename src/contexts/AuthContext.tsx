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

      const roleData = roleResponse.success && roleResponse.data && (roleResponse.data as any[]).length > 0
        ? (roleResponse.data as any[])[0]?.role
        : null;
      const profileData = profileResponse.success && profileResponse.data && (profileResponse.data as any[]).length > 0
        ? (profileResponse.data as any[])[0]
        : null;

      setRole(roleData ?? null);
      setProfile(profileData as Profile | null);
    } catch (error) {
      console.error('Error fetching user data:', error);
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

  const logout = async () => {
    await javaApi.signOut();
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAuthenticated: !!user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
