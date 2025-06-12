import api from "../api";

export const getTotalSessions = async () => {
    const response = await api.get('/api/sessions/');
    return response;
};

export const getTotalConversations = async () => {
    const response = await api.get('/api/messages/');
    return response;
};