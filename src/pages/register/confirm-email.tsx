import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {Button, Loader, Paper, Text} from '@mantine/core';
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout';
import {confirmEmail} from '@/services/register';

const ConfirmEmailPage = () => {
    const router = useRouter();
    const {token} = router.query;
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        confirmEmail(token as string)
            .then(() => {
                setSuccess(true);
                setMessage('Email confirmado com sucesso! Você já pode fazer login.');
            })
            .catch((error) => {
                setSuccess(false);
                setMessage(
                    error?.response?.data?.detail || 'Token inválido ou expirado.'
                );
            })
            .finally(() => setLoading(false));
    }, [token]);

    return (
        <HomeBaseLayout title="Confirmação de Email">
            <Paper p="lg" radius="md" withBorder mt="xl" style={{maxWidth: 400, margin: '0 auto'}}>
                {loading ? (
                    <Loader/>
                ) : (
                    <>
                        <Text size="lg" fw={700} mb="md" color={success ? 'green' : 'red'}>
                            {success ? 'Sucesso!' : 'Erro'}
                        </Text>
                        <Text mb="md">{message}</Text>
                        <Button
                            color={success ? 'blue' : 'gray'}
                            onClick={() => router.push('/login')}
                            fullWidth
                        >
                            Ir para o Login
                        </Button>
                    </>
                )}
            </Paper>
        </HomeBaseLayout>
    );
};

export default ConfirmEmailPage;