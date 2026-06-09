import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, the user's role must be in this list to access the route */
  allowedRoles?: string[];
}

/**
 * Guards a route behind authentication and optional role-based access control.
 *
 * Behaviour:
 * - While the initial session check is running → shows a full-screen spinner
 * - Not authenticated → redirects to /login (preserving the intended destination)
 * - Authenticated but wrong role → redirects to / (landing page)
 * - Authenticated and role matches → renders children
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Still restoring session from localStorage — show spinner
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background, #fff)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid rgba(34,197,94,0.2)",
            borderTop: "3px solid #22c55e",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in — send to login, remember where they were trying to go
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but role not permitted for this route
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
