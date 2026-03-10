import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken, notifications as notificationsApi } from '@/lib/api';
import type { GxNotification } from '@/lib/api';

export interface UseNotificationsOptions {
    userId: string | null | undefined;
    role?: string | null;
    onNew?: (n: GxNotification) => void;
}

export function useNotifications({ userId, role, onNew }: UseNotificationsOptions) {
    const [notifications, setNotifications] = useState<GxNotification[]>([]);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    const addNotification = useCallback((n: GxNotification) => {
        setNotifications(prev => [n, ...prev.filter(x => x.id !== n.id)]);
        onNew?.(n);
    }, [onNew]);

    // Fetch existing notifications from REST API on mount
    useEffect(() => {
        if (!userId || !role) return;
        const backendRole = role.toUpperCase().replace(/\s+/g, '_');
        notificationsApi.getAll(backendRole)
            .then(data => {
                if (Array.isArray(data)) {
                    setNotifications(data);
                }
            })
            .catch(() => {
                // Ignore fetch errors — WebSocket will still deliver new ones
            });
    }, [userId, role]);

    useEffect(() => {
        if (!userId) return;

        const token = getToken();
        const socket = new SockJS('/api/ws');
        const client = new Client({
            webSocketFactory: () => socket as WebSocket,
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
                    try {
                        const raw = JSON.parse(message.body);
                        // Ensure isread defaults to false for new WebSocket notifications
                        const n: GxNotification = {
                            ...raw,
                            isread: raw.isread ?? raw.isRead ?? false,
                        };
                        addNotification(n);
                    } catch {
                        // ignore malformed messages
                    }
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: () => setConnected(false),
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [userId, addNotification]);

    const unreadCount = notifications.filter(n => !n.isread).length;

    const markRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isread: true } : n));
        // Sync with backend
        if (role) {
            const backendRole = role.toUpperCase().replace(/\s+/g, '_');
            notificationsApi.markRead(backendRole, id).catch(() => { });
        }
    }, [role]);

    return { notifications, connected, unreadCount, setNotifications, markRead };
}
