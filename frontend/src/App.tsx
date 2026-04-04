import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import "@/i18n";
import "@/lib/apiConfig"; // Validate API configuration on app load
import Index from "./pages/LandingPage";
import Login from "./pages/Login";
import LandRegister from "./pages/LandRegister";
import NotFound from "./pages/NotFound";
import LandownerDashboard from "./pages/LandownerDashboard";
import FieldManagerDashboard from "./pages/FieldManagerDashboard";
import ExpertDashboard from "./pages/ExpertDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFarmRegistration from "./pages/admin/AdminFarmRegistration";
import AdminWeather from "./pages/admin/AdminWeather";
import AdminExports from "./pages/admin/AdminExports";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminDrones from "./pages/admin/AdminDrones";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLand from "./pages/admin/AdminLand";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminDiagnostics from "./pages/admin/AdminDiagnostics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLabSamples from "./pages/admin/AdminLabSamples";
import Workflow from "./pages/Workflow";
import MyFarms from "./pages/landowner/MyFarms";
import SoilReports from "./pages/landowner/SoilReports";
import CropPlans from "./pages/landowner/CropPlans";
import LiveUpdates from "./pages/landowner/LiveUpdates";
import InputCosts from "./pages/landowner/InputCosts";
import YieldProfit from "./pages/landowner/YieldProfit";
import SeasonReports from "./pages/landowner/SeasonReports";
import TodayTasks from "./pages/fieldmanager/TodayTasks";
import AssignedFarms from "./pages/fieldmanager/AssignedFarms";
import LogOperations from "./pages/fieldmanager/LogOperations";
import WorkerManagement from "./pages/fieldmanager/WorkerManagement";
import UploadPhotos from "./pages/fieldmanager/UploadPhotos";
import FlagIssues from "./pages/fieldmanager/FlagIssues";
import SoilSampleQueue from "./pages/expert/SoilSampleQueue";
import LabResults from "./pages/expert/LabResults";
import CropSuggestions from "./pages/expert/CropSuggestions";
import CropCalendar from "./pages/expert/CropCalendar";
import PestAlerts from "./pages/expert/PestAlerts";
import Prescriptions from "./pages/expert/Prescriptions";

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
    <Route path="/workflow" element={<Workflow />} />
    <Route path="/login" element={<Login />} />
    <Route path="/land-register" element={<LandRegister />} />
    <Route path="/dashboard/landowner" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><Navigate to="/landowner" replace /></ProtectedRoute>} />
    <Route path="/dashboard/cluster-admin" element={<ProtectedRoute allowedRoles={['admin']}><Navigate to="/admin" replace /></ProtectedRoute>} />
    <Route path="/dashboard/expert" element={<ProtectedRoute allowedRoles={['expert', 'admin']}><Navigate to="/expert" replace /></ProtectedRoute>} />
    <Route path="/dashboard/field-manager" element={<ProtectedRoute allowedRoles={['fieldmanager', 'admin']}><Navigate to="/fieldmanager" replace /></ProtectedRoute>} />
    <Route path="/landowner" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><LandownerDashboard /></ProtectedRoute>} />
    <Route path="/landowner/my-farms" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><MyFarms /></ProtectedRoute>} />
    <Route path="/landowner/soil-reports" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><SoilReports /></ProtectedRoute>} />
    <Route path="/landowner/crop-plans" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><CropPlans /></ProtectedRoute>} />
    <Route path="/landowner/live-updates" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><LiveUpdates /></ProtectedRoute>} />
    <Route path="/landowner/input-costs" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><InputCosts /></ProtectedRoute>} />
    <Route path="/landowner/yield-profit" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><YieldProfit /></ProtectedRoute>} />
    <Route path="/landowner/season-reports" element={<ProtectedRoute allowedRoles={['landowner', 'admin']}><SeasonReports /></ProtectedRoute>} />
    <Route path="/fieldmanager" element={<ProtectedRoute allowedRoles={['fieldmanager', 'admin']}><FieldManagerDashboard /></ProtectedRoute>} />
    <Route path="/fieldmanager/today-tasks" element={<ProtectedRoute allowedRoles={['fieldmanager', 'admin']}><TodayTasks /></ProtectedRoute>} />
    <Route path="/fieldmanager/my-farms" element={<ProtectedRoute allowedRoles={['fieldmanager', 'admin']}><AssignedFarms /></ProtectedRoute>} />
    <Route path="/fieldmanager/log-operations" element={<ProtectedRoute allowedRoles={['fieldmanager', 'admin']}><LogOperations /></ProtectedRoute>} />
    <Route path="/fieldmanager/worker-management" element={<ProtectedRoute allowedRoles={['fieldmanager', 'admin']}><WorkerManagement /></ProtectedRoute>} />
    <Route path="/fieldmanager/upload-photos" element={<ProtectedRoute allowedRoles={['fieldmanager', 'admin']}><UploadPhotos /></ProtectedRoute>} />
    <Route path="/fieldmanager/flag-issues" element={<ProtectedRoute allowedRoles={['fieldmanager', 'admin']}><FlagIssues /></ProtectedRoute>} />
    <Route path="/expert" element={<ProtectedRoute allowedRoles={['expert', 'admin']}><ExpertDashboard /></ProtectedRoute>} />
    <Route path="/expert/soil-queue" element={<ProtectedRoute allowedRoles={['expert', 'admin']}><SoilSampleQueue /></ProtectedRoute>} />
    <Route path="/expert/lab-results" element={<ProtectedRoute allowedRoles={['expert', 'admin']}><LabResults /></ProtectedRoute>} />
    <Route path="/expert/crop-suggestions" element={<ProtectedRoute allowedRoles={['expert', 'admin']}><CropSuggestions /></ProtectedRoute>} />
    <Route path="/expert/crop-calendar" element={<ProtectedRoute allowedRoles={['expert', 'admin']}><CropCalendar /></ProtectedRoute>} />
    <Route path="/expert/pest-alerts" element={<ProtectedRoute allowedRoles={['expert', 'admin']}><PestAlerts /></ProtectedRoute>} />
    <Route path="/expert/prescriptions" element={<ProtectedRoute allowedRoles={['expert', 'admin']}><Prescriptions /></ProtectedRoute>} />
    <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker', 'user', 'admin']}><WorkerDashboard /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="land" element={<AdminLand />} />
      <Route path="farm-registration" element={<AdminFarmRegistration />} />
      <Route path="lab-samples" element={<AdminLabSamples />} />
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
