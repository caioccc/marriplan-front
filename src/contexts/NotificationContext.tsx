import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {
    fetchNotificationUnread,
    markAllAsRead,
    markAllAsUnread,
    markAsRead,
    markAsUnread,
    removeAllNotifications,
    removeNotification
} from '@/services/notifications';
import {Notification} from '@/interfaces/common';
import {useAuth} from "@/contexts/AuthContext";

type NotificationContextType = {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    hasMore: boolean;
    fetchMore: () => Promise<void>;
    refresh: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAsUnread: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    markAllAsUnread: () => Promise<void>;
    removeNotification: (id: string) => Promise<void>;
    removeAllNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({children}: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const {user} = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const refresh = async () => {
        if (!user) return;
        setLoading(true);
        const data = await fetchNotificationUnread(1);
        setNotifications(data.results);
        setHasMore(data.next !== null);
        setUnreadCount(data.count);
        setPage(2);
        setLoading(false);
    };

    const fetchMore = async () => {
        if (!hasMore || !user) return;
        setLoading(true);
        const data = await fetchNotificationUnread(page);
        setNotifications(prev => [...prev, ...data.results]);
        setHasMore(data.next !== null);
        setPage(page + 1);
        setLoading(false);
    };

    useEffect(() => {
        if (!user) return;
        refresh();
        const interval = setInterval(refresh, 60000);
        return () => clearInterval(interval);
    }, [user]);


    if (!user) {
        return (
            <NotificationContext.Provider value={{
                notifications: [],
                unreadCount: 0,
                loading: false,
                hasMore: false,
                fetchMore: async () => {
                },
                refresh: async () => {
                },
                markAsRead: async () => {
                },
                markAsUnread: async () => {
                },
                markAllAsRead: async () => {
                },
                markAllAsUnread: async () => {
                },
                removeNotification: async () => {
                },
                removeAllNotifications: async () => {
                },
            }}>
                {children}
            </NotificationContext.Provider>
        );
    }

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            hasMore,
            fetchMore,
            refresh,
            markAsRead: async (id) => {
                await markAsRead(id);
                refresh();
            },
            markAsUnread: async (id) => {
                await markAsUnread(id);
                refresh();
            },
            markAllAsRead: async () => {
                await markAllAsRead();
                refresh();
            },
            markAllAsUnread: async () => {
                await markAllAsUnread();
                refresh();
            },
            removeNotification: async (id) => {
                await removeNotification(id);
                refresh();
            },
            removeAllNotifications: async () => {
                await removeAllNotifications();
                refresh();
            }
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications deve ser usado dentro do NotificationProvider');
    return ctx;
}