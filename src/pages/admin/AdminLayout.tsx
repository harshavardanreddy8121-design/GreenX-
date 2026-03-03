import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';
import { GreenXLogo } from '@/components/GreenXLogo';
import { NavLink } from '@/components/NavLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  LayoutDashboard, Map, Users, Stethoscope, CloudSun, DollarSign,
  Ship, Settings, LogOut, Menu, X, Package, Plane
} from 'lucide-react';

const navItems = [
  { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { title: 'Land Management', path: '/admin/land', icon: Map },
  { title: 'Farmers', path: '/admin/farmers', icon: Users },
  { title: 'Diagnostics', path: '/admin/diagnostics', icon: Stethoscope },
  { title: 'Weather', path: '/admin/weather', icon: CloudSun },
  { title: 'Finance', path: '/admin/finance', icon: DollarSign },
  { title: 'Exports', path: '/admin/exports', icon: Ship },
  { title: 'Inventory', path: '/admin/inventory', icon: Package },
  { title: 'Drones', path: '/admin/drones', icon: Plane },
  { title: 'Users', path: '/admin/users', icon: Users },
  { title: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <GreenXLogo size="sm" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/admin'}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              activeClassName="bg-primary/10 text-primary font-medium"
              onClick={() => setSidebarOpen(false)}>
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 w-full">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-20 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-card/90 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <LanguageSwitcher compact />
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">{profile?.full_name || user?.email}</span>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
