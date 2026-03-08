import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GreenXLogo } from '@/components/GreenXLogo';
import { NavLink } from '@/components/NavLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LogOut, Menu, X, Bell } from 'lucide-react';
import type { DashboardMenuItem } from '@/config/dashboardMenus';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardShellProps {
    children: React.ReactNode;
    menuItems: DashboardMenuItem[];
    role: string;
}

export default function DashboardShell({ children, menuItems, role }: DashboardShellProps) {
    const { user, profile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();

    const { notifications, unreadCount, markRead } = useNotifications({
        userId: user?.id ?? null,
        onNew: (n) => toast({
            title: n.title,
            description: n.message,
            variant: n.type === 'URGENT' || n.type === 'ALERT' ? 'destructive' : 'default',
        }),
    });

    const handleLogout = () => { logout(); navigate('/'); };

    return (
        <div className="dashboard-shell min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <GreenXLogo size="sm" />
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
                    {menuItems.map(item => (
                        <NavLink
                            key={`${item.path}-${item.title}`}
                            to={item.path}
                            end={item.path === `/${role.toLowerCase()}`}
                            className="dashboard-nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                            activeClassName="dashboard-nav-link-active font-medium"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon className="w-4 h-4" />
                            <span>{item.title}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-border">
                    <button onClick={handleLogout} className="dashboard-logout-btn flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && <div className="fixed inset-0 z-20 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-10 bg-card/90 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1 flex items-center gap-3">
                        <span className="text-sm font-semibold text-primary uppercase tracking-wide">{role}</span>
                    </div>

                    <LanguageSwitcher compact />
                    <ThemeToggle />

                    {/* Notification Bell */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="relative p-2 rounded-lg hover:bg-muted">
                                <Bell className="w-5 h-5 text-muted-foreground" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto p-2 space-y-1">
                            {notifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
                            ) : (
                                notifications.slice(0, 20).map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => markRead(n.id)}
                                        className={`p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors ${!n.isread ? 'bg-primary/5 border border-primary/10' : ''}`}
                                    >
                                        <p className={`text-sm font-medium ${n.type === 'URGENT' || n.type === 'ALERT' ? 'text-destructive' : 'text-foreground'}`}>{n.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                    </div>
                                ))
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="text-sm text-muted-foreground">
                        {profile?.full_name || user?.email}
                        {profile?.uid && <span className="ml-2 font-mono font-bold text-emerald-600">#{profile.uid}</span>}
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
