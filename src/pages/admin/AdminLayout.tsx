import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';
import { ThemeToggle } from '@/components/ThemeToggle';

const adminNavItems = [
  { icon: '📊', label: 'Dashboard', path: '/admin' },
  { icon: '🗺️', label: 'Land Management', path: '/admin/land' },
  { icon: '🌾', label: 'Farm Registration', path: '/admin/farm-registration' },
  { icon: '🧪', label: 'Lab & Samples', path: '/admin/lab-samples' },
  { icon: '🔬', label: 'Diagnostics', path: '/admin/diagnostics' },
  { icon: '🌤️', label: 'Weather', path: '/admin/weather' },
  { icon: '💰', label: 'Finance', path: '/admin/finance' },
  { icon: '📦', label: 'Exports', path: '/admin/exports' },
  { icon: '🏭', label: 'Inventory', path: '/admin/inventory' },
  { icon: '🛩️', label: 'Drones', path: '/admin/drones' },
  { icon: '👥', label: 'Users', path: '/admin/users' },
  { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="gx-dashboard ca-accent">
      <MobileHeader title="Cluster Admin" roleIcon="🏢" />
      {/* ── SIDEBAR ── */}
      <div className="gx-sidebar">
        <div className="gx-sidebar-user">
          <div className="gx-sidebar-avatar" style={{ background: 'var(--gx-green-dim)' }}>🏢</div>
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
        <Outlet />
      </div>
    </div>
  );
}
