import {GoogleLogin} from '@react-oauth/google';
import {loginWithGoogle} from '../services/login/loginService';
import {useToast} from "@/hooks/use-toast";
import {useAuth} from "@/contexts/AuthContext";
import {useRouter} from "next/router";

export function GoogleLoginButton() {
    const {toast} = useToast();
    const {setUser} = useAuth();
    const router = useRouter();

    const handleSuccess = async (credentialResponse: any) => {
        const {credential} = credentialResponse;
        if (credential) {
            try {
                const response = await loginWithGoogle(credential);

                const data = response.data;
                if (data.token) {
                    localStorage.setItem('token', data.token)
                    localStorage.setItem('user', JSON.stringify(data.user))
                    localStorage.setItem('local_user', JSON.stringify(data.local_user))
                    setUser(data.user)
                }
                if (data.token) {
                    setUser(data.user);
                    toast({
                        title: 'Login realizado com sucesso!',
                        description: 'Você está autenticado com Google.',
                    })
                    router.push('/dashboard');
                } else {
                    toast({
                        title: 'Erro ao autenticar',
                        description: 'Token inválido ou expirado. Tente novamente.',
                    })
                    console.error('Token inválido.');
                }
            } catch (error) {
                toast({
                    title: 'Erro no login',
                    description: 'Não foi possível autenticar com o Google. Tente novamente.',
                });
                console.error('Erro ao autenticar com Google', error);
            }
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast({
                title: 'Erro no login',
                description: 'Não foi possível autenticar com o Google. Tente novamente.',
            })}
        />
    );
}