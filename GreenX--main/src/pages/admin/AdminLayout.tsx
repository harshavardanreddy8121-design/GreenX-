import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Building2, Bug, ClipboardList, CloudSun, Factory, FileText, HardHat, LogOut, Map, Microscope, Package, Plane, Settings, TestTubes, Tractor, Users, Wallet, Wheat } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';

const adminNavItems = [
  { icon: <BarChart3 size={18} />, label: 'Overview', path: '/admin', exact: true },
  { icon: <Wheat size={18} />, label: 'Farms', path: '/admin/farms' },
  { icon: <Users size={18} />, label: 'Users', path: '/admin/users' },
  { icon: <TestTubes size={18} />, label: 'Submissions', path: '/admin/submissions' },
  { icon: <Microscope size={18} />, label: 'Experts', path: '/admin/experts' },
  { icon: <Tractor size={18} />, label: 'Field Managers', path: '/admin/field-managers' },
  { icon: <HardHat size={18} />, label: 'Workers', path: '/admin/workers' },
  { icon: <FileText size={18} />, label: 'Soil Reports', path: '/admin/soil-reports' },
  { icon: <Bug size={18} />, label: 'Pest Alerts', path: '/admin/pest-alerts' },
  { icon: <ClipboardList size={18} />, label: 'Prescriptions', path: '/admin/prescriptions' },
];

const adminToolsItems = [
  { icon: <Map size={18} />, label: 'Land Management', path: '/admin/land' },
  { icon: <Wheat size={18} />, label: 'Farm Registration', path: '/admin/farm-registration' },
  { icon: <TestTubes size={18} />, label: 'Lab & Samples', path: '/admin/lab-samples' },
  { icon: <Microscope size={18} />, label: 'Diagnostics', path: '/admin/diagnostics' },
  { icon: <CloudSun size={18} />, label: 'Weather', path: '/admin/weather' },
  { icon: <Wallet size={18} />, label: 'Finance', path: '/admin/finance' },
  { icon: <Package size={18} />, label: 'Exports', path: '/admin/exports' },
  { icon: <Factory size={18} />, label: 'Inventory', path: '/admin/inventory' },
  { icon: <Plane size={18} />, label: 'Drones', path: '/admin/drones' },
  { icon: <Users size={18} />, label: 'User Management', path: '/admin/users-manage' },
  { icon: <Settings size={18} />, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="gx-dashboard ca-accent">
      <MobileHeader title="Cluster Admin" roleIcon={<Building2 size={18} />} />
      {/* ── SIDEBAR ── */}
      <div className="gx-sidebar">
        <div className="gx-sidebar-user">
          <div className="gx-sidebar-avatar" style={{ background: 'var(--gx-green-dim)' }}><Building2 size={22} /></div>
          <div className="gx-sidebar-name">{userName}</div>
          <div className="gx-sidebar-role">CLUSTER ADMIN</div>
          <div className="gx-theme-switch">
            <span>Theme</span>
            <ThemeToggle className="gx-theme-toggle" />
          </div>
        </div>

        <div className="gx-nav-group-label">Data</div>
        {adminNavItems.map(item => {
          const isActive = (item as any).exact
            ? location.pathname === item.path
            : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              className={`gx-nav-item${isActive ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="gx-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        <div className="gx-nav-group-label">Tools</div>
        {adminToolsItems.map(item => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              className={`gx-nav-item${isActive ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="gx-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          );
        })}

        <div className="gx-sidebar-logout">
          <button onClick={handleLogout}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="gx-main">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
          <NotificationBell role="CLUSTER_ADMIN" />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
