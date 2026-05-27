import api from "../api";

export const getSettings = async () => {
    try {
        const response = await api.get('/api/settings/');
        return response.data;
    } catch (error) {
        if (!(error as any)?.response) {
            return null;
        }

        throw error;
    }
};

export const updateSettings = async (data: any) => {
    try {
        const response = await api.patch('/api/settings/', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteAllSessions = async () => {
    try {
        const response = await api.delete('/api/clear-sessions/delete-all/');
        return response.data;
    } catch (error) {
        throw error;
    }
};