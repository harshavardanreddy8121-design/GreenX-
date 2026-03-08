import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getToken } from '@/lib/api';
import type { GxNotification } from '@/lib/api';

export interface UseNotificationsOptions {
    userId: string | null | undefined;
    onNew?: (n: GxNotification) => void;
}

export function useNotifications({ userId, onNew }: UseNotificationsOptions) {
    const [notifications, setNotifications] = useState<GxNotification[]>([]);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    const addNotification = useCallback((n: GxNotification) => {
        setNotifications(prev => [n, ...prev.filter(x => x.id !== n.id)]);
        onNew?.(n);
    }, [onNew]);

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
                        const n = JSON.parse(message.body) as GxNotification;
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
    }, []);

    return { notifications, connected, unreadCount, setNotifications, markRead };
}
