import api from "../api";

export async function generate2FA() {
    const {data} = await api.get('/api/auth/2fa/generate/');
    return {
        otp_secret: data.otp_secret,
        otp_uri: data.otp_uri,
        qr_code_base64: data.qr_code_base64,
    };
}

export async function enable2FA(otp_code: string) {
    const {data} = await api.post('/api/auth/2fa/enable/', {otp_code});
    return data;
}

export async function disable2FA() {
    const {data} = await api.post('/api/auth/2fa/disable/');
    return data;
}