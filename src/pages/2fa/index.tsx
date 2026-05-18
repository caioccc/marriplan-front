import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'; // 1. Importamos o useEffect
import { Button, Paper, PinInput, Text } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { loginUser } from '@/services/login/loginService';
import { useAuth } from '@/contexts/AuthContext';
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout';
import { IconArrowLeft, IconLogin } from '@tabler/icons-react';
import { useToast } from "@/hooks/use-toast";

const otpSchema = z.object({
    otp: z
        .string()
        .regex(/^\d{6}$/, 'Informe os 6 dígitos numéricos do código'),
});

export default function TwoFAPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();

    // 2. Criamos estados para armazenar as credenciais com segurança
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    // 3. Buscamos do localStorage apenas quando o componente for montado no cliente
    useEffect(() => {
        const storedEmail = localStorage.getItem('2fa_email') || '';
        const storedPassword = localStorage.getItem('2fa_password') || '';
        
        setCredentials({ email: storedEmail, password: storedPassword });
    }, []);

    const form = useForm({
        initialValues: { otp: '' },
        validate: zodResolver(otpSchema),
    });

    const handleSubmit = async (values: { otp: string }) => {
        setLoading(true);
        setError('');
        try {
            // 4. Usamos os dados guardados no estado do React
            const response = await loginUser(
                { email: credentials.email, password: credentials.password }, 
                values.otp
            );
            const data = response.data;
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('local_user', JSON.stringify(data.local_user));
                
                // Removi a duplicação do bloco "if (data.token)" que estava no seu código original
                setUser(data.user);
                toast({
                    title: 'Login realizado com sucesso!',
                    description: 'Você está autenticado com 2FA.',
                });
                router.push('/dashboard');
            } else {
                toast({
                    title: 'Erro ao autenticar',
                    description: 'Código inválido ou expirado. Tente novamente.',
                });
                setError('Código inválido.');
            }
        } catch {
            toast({
                title: 'Erro ao autenticar',
                description: 'Código inválido ou expirado. Tente novamente.',
            });
            setError('Código inválido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <HomeBaseLayout title="Autenticação de dois fatores">
            <Paper maw={400} mx="auto" mt={80} p="lg" withBorder>
                <Text fw={600} size="lg" mb="md" ta="center">
                    Valide seu acesso
                </Text>
                <Text size="sm" ta="center" mb="md">
                    Abra seu aplicativo autenticador e digite o código de 6 dígitos gerado para sua conta.
                </Text>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <PinInput
                            length={6}
                            type="number"
                            value={form.values.otp}
                            onChange={value => {
                                if (/^\d*$/.test(value)) {
                                    form.setFieldValue('otp', value);
                                }
                            }}
                            oneTimeCode
                            error={!!form.errors.otp || !!error}
                            inputMode="numeric"
                            placeholder=""
                        />
                    </div>
                    {(form.errors.otp || error) && (
                        <Text size="xs" color="red" ta="center" mt="xs">
                            {form.errors.otp || error}
                        </Text>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 32 }}>
                        <Button
                            variant="default"
                            onClick={() => router.push('/login')}
                            type="button"
                            leftSection={<IconArrowLeft size={18} />}
                        >
                            Voltar
                        </Button>
                        <Button
                            type="submit"
                            loading={loading}
                            rightSection={<IconLogin size={18} />}
                        >
                            Entrar
                        </Button>
                    </div>
                </form>
                <Text size="xs" c="dimmed" ta="center" mt="md">
                    Caso não consiga acessar, verifique se o horário do seu dispositivo está correto e tente novamente.
                </Text>
            </Paper>
        </HomeBaseLayout>
    );
}