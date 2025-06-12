import api from '../api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loginUser = async (payload: any, code: string) => {
    const body = {
        ...payload,
        otp_code: code
    }

    const data = await api.post(
        '/api/auth/login/',
        body
    )

    return data
}

export const loginWithGoogle = async (token: string) => {
    const response = await api.post('/api/auth/google/', {
        token,
    });
    return response;
}