import {useRouter} from 'next/router';
import {useState} from 'react';
import {Button, Group, Paper, PasswordInput, Text, ThemeIcon, Loader} from '@mantine/core';
import {IconCheck, IconX, IconLogin, IconKey, IconRefresh} from '@tabler/icons-react';
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout';
import {hasLength, isNotEmpty, useForm} from '@mantine/form';
import {resetPassword} from '@/services/user';
import {useTranslation} from 'react-i18next';
import axios from 'axios';

const ResetPasswordTokenPage = () => {
    const router = useRouter();
    const {token} = router.query;
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const {t} = useTranslation();
    const form = useForm({
        initialValues: {password: '', confirmPassword: ''},
        validate: {
            password: (value) =>
                isNotEmpty(t('register.password_required'))(value) ||
                hasLength({min: 6}, t('register.password_length'))(value),
            confirmPassword: (value, values) =>
                isNotEmpty(t('register.confirm_password_required'))(value) ||
                (value !== values.password && t('register.passwords_not_match')),
        },
    });

    const handleSubmit = async (values: { password: string }) => {
        setLoading(true);
        setError(null);
        try {
            await resetPassword(token as string, values.password);
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    'Erro ao redefinir senha. Verifique os dados e tente novamente.'
                );
            } else {
                setError('Erro desconhecido ao redefinir senha.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTryAgain = () => {
        setError(null);
        form.reset();
    };

    return (
        <HomeBaseLayout title="Nova senha">
            <Paper p="lg" radius="md" withBorder mt="xl" style={{maxWidth: 400, margin: '0 auto'}}>
                <Text mb="md" size="sm" color="dimmed">
                    Informe uma nova senha para sua conta. Após redefinir, você poderá acessar normalmente com a nova
                    senha.
                </Text>
                {loading && (
                    <Group justify="center" mb="md">
                        <Loader size="sm"/>
                        <Text size="sm" color="dimmed">Redefinindo senha...</Text>
                    </Group>
                )}
                {success ? (
                    <Group align="center">
                        <ThemeIcon color="green" size="lg" radius="xl">
                            <IconCheck size={20}/>
                        </ThemeIcon>
                        <Text color="green">Senha redefinida com sucesso! Redirecionando...</Text>
                    </Group>
                ) : error ? (
                    <Group align="center" style={{flexDirection: 'column'}}>
                        <ThemeIcon color="red" size="lg" radius="xl">
                            <IconX size={20}/>
                        </ThemeIcon>
                        <Text color="red">{error}</Text>
                        <Group mt="md">
                            <Button
                                color="gray"
                                variant="outline"
                                leftSection={<IconLogin size={18}/>}
                                onClick={() => router.push('/login')}
                            >
                                Ir para login
                            </Button>
                            <Button
                                color="blue"
                                variant="outline"
                                leftSection={<IconRefresh size={18}/>}
                                onClick={handleTryAgain}
                            >
                                Tentar novamente
                            </Button>
                        </Group>
                    </Group>
                ) : (
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <PasswordInput
                            label="Nova senha"
                            {...form.getInputProps('password')}
                            required
                            disabled={loading}
                        />
                        <PasswordInput
                            label="Repetir nova senha"
                            {...form.getInputProps('confirmPassword')}
                            required
                            mt="md"
                            disabled={loading}
                        />
                        <Group mt="md" grow>
                            <Button
                                color="gray"
                                variant="outline"
                                leftSection={<IconLogin size={18}/>}
                                type="button"
                                onClick={() => router.push('/login')}
                                disabled={loading}
                            >
                                Voltar
                            </Button>
                            <Button
                                type="submit"
                                color="blue"
                                loading={loading}
                                leftSection={<IconKey size={18}/>}
                                disabled={loading}
                            >
                                Redefinir senha
                            </Button>
                        </Group>
                    </form>
                )}
            </Paper>
        </HomeBaseLayout>
    );
};

export default ResetPasswordTokenPage;