import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Building2, CloudSun, Factory, LogOut, Map, Microscope, Package, Plane, Settings, TestTubes, Users, Wallet, Wheat } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';

const adminNavItems = [
  { icon: <BarChart3 size={18} />, label: 'Dashboard', path: '/admin' },
  { icon: <Map size={18} />, label: 'Land Management', path: '/admin/land' },
  { icon: <Wheat size={18} />, label: 'Farm Registration', path: '/admin/farm-registration' },
  { icon: <TestTubes size={18} />, label: 'Lab & Samples', path: '/admin/lab-samples' },
  { icon: <Microscope size={18} />, label: 'Diagnostics', path: '/admin/diagnostics' },
  { icon: <CloudSun size={18} />, label: 'Weather', path: '/admin/weather' },
  { icon: <Wallet size={18} />, label: 'Finance', path: '/admin/finance' },
  { icon: <Package size={18} />, label: 'Exports', path: '/admin/exports' },
  { icon: <Factory size={18} />, label: 'Inventory', path: '/admin/inventory' },
  { icon: <Plane size={18} />, label: 'Drones', path: '/admin/drones' },
  { icon: <Users size={18} />, label: 'Users', path: '/admin/users' },
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

        <div className="gx-nav-group-label">Management</div>
        {adminNavItems.map(item => {
          const isActive = item.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);
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
