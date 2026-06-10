import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * Guards a route behind authentication and optional role-based access control.
 *
 * - Shows a loading spinner while the session is being verified.
 * - Redirects to /login (preserving the attempted URL) if not authenticated.
 * - Redirects to / if the user's role is not in allowedRoles.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--background)" }}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-green-500 border-r-green-500" />
        <p className="text-sm text-muted-foreground">Verifying session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role is known but not in the allowed list → redirect home
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // allowedRoles specified but role still null after loading → back to login
  if (allowedRoles && !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
