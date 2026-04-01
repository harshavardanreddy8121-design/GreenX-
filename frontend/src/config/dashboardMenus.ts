import {
    AlertCircle,
    Bug,
    Calendar,
    CloudSun,
    DollarSign,
    FileText,
    FlaskConical,
    Image,
    LayoutDashboard,
    Leaf,
    MapPin,
    Microscope,
    Package,
    Plane,
    Settings,
    Ship,
    Sprout,
    TrendingUp,
    Upload,
    Users,
} from 'lucide-react';

export interface DashboardMenuItem {
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
}

export const landownerMenuItems: DashboardMenuItem[] = [
    { title: 'Dashboard', path: '/landowner', icon: LayoutDashboard },
    { title: 'My Farms', path: '/landowner/my-farms', icon: MapPin },
    { title: 'Soil Reports', path: '/landowner/soil-reports', icon: FlaskConical },
    { title: 'Crop Plans', path: '/landowner/crop-plans', icon: Leaf },
    { title: 'Live Updates', path: '/landowner/live-updates', icon: Image },
    { title: 'Input Costs', path: '/landowner/input-costs', icon: DollarSign },
    { title: 'Yield & Profit', path: '/landowner/yield-profit', icon: TrendingUp },
    { title: 'Season Reports', path: '/landowner/season-reports', icon: FileText },
];

export const fieldManagerMenuItems: DashboardMenuItem[] = [
    { title: 'Dashboard', path: '/fieldmanager', icon: LayoutDashboard },
    { title: "Today's Tasks", path: '/fieldmanager/today-tasks', icon: Calendar },
    { title: 'My Farms', path: '/fieldmanager/my-farms', icon: MapPin },
    { title: 'Log Operations', path: '/fieldmanager/log-operations', icon: Package },
    { title: 'Worker Management', path: '/fieldmanager/worker-management', icon: Users },
    { title: 'Upload Photos', path: '/fieldmanager/upload-photos', icon: Upload },
    { title: 'Flag Issues', path: '/fieldmanager/flag-issues', icon: Bug },
];

export const expertMenuItems: DashboardMenuItem[] = [
    { title: 'Dashboard', path: '/expert', icon: LayoutDashboard },
    { title: 'Soil Sample Queue', path: '/expert/soil-queue', icon: FlaskConical },
    { title: 'Lab Results', path: '/expert/lab-results', icon: Microscope },
    { title: 'Crop Suggestions', path: '/expert/crop-suggestions', icon: Sprout },
    { title: 'Crop Calendar', path: '/expert/crop-calendar', icon: Calendar },
    { title: 'Pest/Disease Alerts', path: '/expert/pest-alerts', icon: AlertCircle },
    { title: 'Prescriptions', path: '/expert/prescriptions', icon: FileText },
];

export const adminMenuItems: DashboardMenuItem[] = [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'Land Management', path: '/admin/land', icon: MapPin },
    { title: 'Farmers', path: '/admin/farmers', icon: Users },
    { title: 'Lab & Samples', path: '/admin/lab-samples', icon: FlaskConical },
    { title: 'Diagnostics', path: '/admin/diagnostics', icon: FlaskConical },
    { title: 'Weather', path: '/admin/weather', icon: CloudSun },
    { title: 'Finance', path: '/admin/finance', icon: DollarSign },
    { title: 'Exports', path: '/admin/exports', icon: Ship },
    { title: 'Inventory', path: '/admin/inventory', icon: Package },
    { title: 'Drones', path: '/admin/drones', icon: Plane },
    { title: 'Users', path: '/admin/users', icon: Users },
    { title: 'Settings', path: '/admin/settings', icon: Settings },
];
