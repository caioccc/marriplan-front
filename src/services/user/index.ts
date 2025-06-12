import api from "../api";

export const getUsers = async () => {
    const response = await api.get("/api/user/");
    return response;
}

export const getUser = async (id) => {
    const response = await api.get(`/api/auth/user/`);
    return response;
}

export const sendResetPasswordEmail = (email: string) => {
    const response = api.post('/api/auth/reset-password/', {email});
    return response;
}

export const resetPassword = (token: string, password: string) => {
    const response = api.post('/api/auth/reset-password/confirm/', {token, password});
    return response;
}

export const updateProfile = async (data: { name: string, username: string }) => {
    const response = await api.patch('/api/user/update-profile/', data);
    return response.data;
};