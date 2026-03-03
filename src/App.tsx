import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "@/i18n";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import LandownerDashboard from "./pages/LandownerDashboard";
import FieldManagerDashboard from "./pages/FieldManagerDashboard";
import ExpertDashboard from "./pages/ExpertDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFarmers from "./pages/admin/AdminFarmers";
import AdminWeather from "./pages/admin/AdminWeather";
import AdminExports from "./pages/admin/AdminExports";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminDrones from "./pages/admin/AdminDrones";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLand from "./pages/admin/AdminLand";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminDiagnostics from "./pages/admin/AdminDiagnostics";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/" />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/landowner" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><LandownerDashboard /></ProtectedRoute>} />
    <Route path="/fieldmanager" element={<ProtectedRoute allowedRoles={['fieldmanager', 'admin']}><FieldManagerDashboard /></ProtectedRoute>} />
    <Route path="/expert" element={<ProtectedRoute allowedRoles={['expert', 'admin']}><ExpertDashboard /></ProtectedRoute>} />
    <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker', 'admin']}><WorkerDashboard /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="land" element={<AdminLand />} />
      <Route path="farmers" element={<AdminFarmers />} />
      <Route path="diagnostics" element={<AdminDiagnostics />} />
      <Route path="weather" element={<AdminWeather />} />
      <Route path="finance" element={<AdminFinance />} />
      <Route path="exports" element={<AdminExports />} />
      <Route path="inventory" element={<AdminInventory />} />
      <Route path="drones" element={<AdminDrones />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
