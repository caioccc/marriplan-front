import api from "../api";

export const sendMessage = async (session_id: string, content: string) => {
    try {
        const response = await api.post('/api/messages/send-message/', {
            session_id,
            content,
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export const createSession = async () => {
    try {
        const response = await api.post('/api/sessions/');
        return response;
    } catch (error) {
        throw error;
    }
};

const handleFetchResponse = async (response: Response) => {
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&reason=session_expired`;
        return;
    }
    if (response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/403';
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&reason=session_expired`;
        return;
    }
    return response;
};

export const streamMessage = async (content: string, session_id: string) => {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/api/messages/stream-message/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
            content: content,
            session_id: session_id
        }),
    });

    await handleFetchResponse(response);

    if (!response.body) throw new Error('Sem resposta do servidor');
    return response.body.getReader();
};


export const deleteSession = async (session_id: string) => {
    try {
        const response = await api.delete(`/api/sessions/delete-by-session-id/${session_id}/`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateSession = async (session_id: string, data: { title: string }) => {
    try {
        const response = await api.patch(`/api/sessions/${session_id}/`, data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateMessage = async (messageId: number, data: { content: string }) => {
    try {
        const response = await api.patch(`/api/messages/${messageId}/`, data);
        return response;
    } catch (error) {
        throw error;
    }
};