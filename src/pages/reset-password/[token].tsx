import {useRouter} from 'next/router';
import {useState} from 'react';
import {Button, Group, Loader, PasswordInput, Stack, Text, ThemeIcon} from '@mantine/core';
import {IconCheck, IconX, IconLogin, IconKey, IconRefresh} from '@tabler/icons-react';
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout';
import {hasLength, isNotEmpty, useForm} from '@mantine/form';
import {resetPassword} from '@/services/user';
import {useTranslation} from 'react-i18next';
import axios from 'axios';
import {authInputStyles, primaryButtonStyles, softButtonStyles} from '@/styles/marriplanStyles';

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
        <HomeBaseLayout
            title="Nova senha"
            description="Defina uma nova senha com o visual premium da plataforma."
        >
            <Stack gap="lg">
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
                    <Stack align="center" gap="sm">
                        <ThemeIcon size="lg" radius="xl" style={{ background: 'var(--marriplan-champagne)', color: 'var(--marriplan-rose)' }}>
                            <IconCheck size={20}/>
                        </ThemeIcon>
                        <Text ta="center" style={{ color: 'var(--marriplan-text)' }}>Senha redefinida com sucesso! Redirecionando...</Text>
                    </Stack>
                ) : error ? (
                    <Stack align="center" gap="sm">
                        <ThemeIcon size="lg" radius="xl" style={{ background: 'rgba(181, 139, 122, 0.16)', color: 'var(--marriplan-rose)' }}>
                            <IconX size={20}/>
                        </ThemeIcon>
                        <Text ta="center" style={{ color: 'var(--marriplan-rose)' }}>{error}</Text>
                        <Group mt="md" grow>
                            <Button
                                variant="default"
                                leftSection={<IconLogin size={18}/>}
                                onClick={() => router.push('/login')}
                                styles={softButtonStyles}
                            >
                                Ir para login
                            </Button>
                            <Button
                                variant="default"
                                leftSection={<IconRefresh size={18}/>}
                                onClick={handleTryAgain}
                                styles={softButtonStyles}
                            >
                                Tentar novamente
                            </Button>
                        </Group>
                    </Stack>
                ) : (
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <PasswordInput
                            label="Nova senha"
                            {...form.getInputProps('password')}
                            required
                            styles={authInputStyles}
                            disabled={loading}
                        />
                        <PasswordInput
                            label="Repetir nova senha"
                            {...form.getInputProps('confirmPassword')}
                            required
                            mt="md"
                            styles={authInputStyles}
                            disabled={loading}
                        />
                        <Group mt="md" grow>
                            <Button
                                variant="default"
                                leftSection={<IconLogin size={18}/>}
                                type="button"
                                onClick={() => router.push('/login')}
                                disabled={loading}
                                styles={softButtonStyles}
                            >
                                Voltar
                            </Button>
                            <Button
                                type="submit"
                                loading={loading}
                                leftSection={<IconKey size={18}/>}
                                disabled={loading}
                                styles={primaryButtonStyles}
                            >
                                Redefinir senha
                            </Button>
                        </Group>
                    </form>
                )}
            </Stack>
        </HomeBaseLayout>
    );
};

export default ResetPasswordTokenPage;