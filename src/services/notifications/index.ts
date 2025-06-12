import api from '../api';
import { toast } from '@/hooks/use-toast';

export async function fetchNotifications(page = 1, pageSize = 10) {
    const {data} = await api.get(`/api/notifications/?page=${page}&page_size=${pageSize}`);
    return data;
}

export async function fetchNotificationUnread(page = 1, pageSize = 10) {
    try {
        const {data} = await api.get(`/api/notifications/unread/?page=${page}&page_size=${pageSize}`);
        return data;
    } catch (error) {
        toast({
            title: 'Erro de conexão',
            description: 'O servidor está indisponível. Tente novamente mais tarde.',
        });
        return { results: [], count: 0, next: null };
    }
}

export async function markAsRead(id: string) {
    return api.post(`/api/notifications/${id}/mark-read/`);
}

export async function markAsUnread(id: string) {
    return api.post(`/api/notifications/${id}/mark-unread/`);
}

export async function markAllAsRead() {
    return api.post(`/api/notifications/mark-all-read/`);
}

export async function markAllAsUnread() {
    return api.post(`/api/notifications/mark-all-unread/`);
}

export async function removeNotification(id: string) {
    return api.delete(`/api/notifications/${id}/`);
}

export async function removeAllNotifications() {
    return api.delete(`/api/notifications/delete-all/`);
}