import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

interface NotificationBellProps {
    role: string; // Backend role format: FIELD_MANAGER, EXPERT, CLUSTER_ADMIN, LAND_OWNER
}

export function NotificationBell({ role }: NotificationBellProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const { notifications, unreadCount, markRead } = useNotifications({
        userId: user?.id ?? null,
        role,
        onNew: (n) => toast.info(n.title || 'New notification'),
    });

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setOpen(o => !o)}
                className="gx-bell-btn"
                style={{
                    position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '6px 8px', borderRadius: 8, color: 'var(--gx-text1)',
                }}
                title={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        minWidth: 16, height: 16, borderRadius: 99,
                        background: '#ef4444', color: '#fff',
                        fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px', lineHeight: 1,
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 6,
                    width: 320, maxHeight: 400, overflowY: 'auto',
                    background: 'var(--gx-card-bg, #fff)', border: '1px solid var(--gx-border, #ddd)',
                    borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,.18)', zIndex: 999,
                    padding: 6,
                }}>
                    <div style={{ padding: '8px 10px', fontWeight: 700, fontSize: 13, color: 'var(--gx-text1)', borderBottom: '1px solid var(--gx-border, #eee)' }}>
                        Notifications {unreadCount > 0 && <span style={{ color: '#ef4444' }}>({unreadCount} new)</span>}
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gx-text2)', fontSize: 13 }}>No notifications yet</div>
                    ) : (
                        notifications.slice(0, 25).map(n => (
                            <div
                                key={n.id}
                                onClick={() => markRead(n.id)}
                                style={{
                                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginTop: 3,
                                    background: !n.isread ? 'var(--gx-highlight, rgba(34,197,94,.06))' : 'transparent',
                                    borderLeft: !n.isread ? '3px solid #22c55e' : '3px solid transparent',
                                }}
                            >
                                <div style={{ fontSize: 13, fontWeight: !n.isread ? 600 : 400, color: 'var(--gx-text1)' }}>{n.title || 'Notification'}</div>
                                <div style={{ fontSize: 11, color: 'var(--gx-text2)', marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
