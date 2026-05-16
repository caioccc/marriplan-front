import {useState} from 'react';
import {Button, Group, Stack, Text, TextInput, ThemeIcon} from '@mantine/core';
import {IconCheck, IconLogin, IconMailForward, IconRefresh, IconX} from '@tabler/icons-react';
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout';
import {isEmail, isNotEmpty, useForm} from '@mantine/form';
import {sendResetPasswordEmail} from '@/services/user';
import {useTranslation} from 'react-i18next';
import {useRouter} from 'next/router';
import {authInputStyles, primaryButtonStyles, softButtonStyles} from '@/styles/marriplanStyles';

const ResetPasswordPage = () => {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {t} = useTranslation();
    const router = useRouter();
    const form = useForm({
        initialValues: {email: ''},
        validate: {
            email: (value) =>
                isNotEmpty(t('register.email_required'))(value) ||
                isEmail(t('register.email_invalid'))(value),
        }
    });

    const handleSubmit = async (values: { email: string }) => {
        setLoading(true);
        setError(null);
        try {
            await sendResetPasswordEmail(values.email);
            setSent(true);
        } catch (e: any) {
            setError(e?.response?.data?.detail || 'Erro ao enviar e-mail de redefinição.');
        } finally {
            setLoading(false);
        }
    };

    const handleTryAgain = () => {
        setError(null);
        setSent(false);
        form.reset();
    };

    return (
        <HomeBaseLayout
            title="Alterar senha"
            description="Receba um link para redefinir sua senha usando os tons suaves da marca."
        >
            <Stack gap="lg">
                <Text mb="md" size="sm" color="dimmed">
                    Informe seu e-mail para receber um link de redefinição de senha. Caso o e-mail informado exista em nossa base, você receberá as instruções.
                </Text>
                {sent ? (
                    <Stack align="center" gap="sm">
                        <ThemeIcon size="lg" radius="xl" style={{ background: 'var(--marriplan-champagne)', color: 'var(--marriplan-rose)' }}>
                            <IconCheck size={20}/>
                        </ThemeIcon>
                        <Text ta="center" style={{ color: 'var(--marriplan-text)' }}>
                            Se o e-mail informado existir, você receberá um link para redefinir sua senha.
                        </Text>
                        <Button
                            mt="md"
                            variant="default"
                            leftSection={<IconLogin size={18}/>}
                            onClick={() => router.push('/login')}
                            styles={softButtonStyles}
                        >
                            Voltar para login
                        </Button>
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
                                leftSection={<IconRefresh size={18}/>}
                                onClick={handleTryAgain}
                                styles={softButtonStyles}
                            >
                                Tentar novamente
                            </Button>
                            <Button
                                variant="default"
                                leftSection={<IconLogin size={18}/>}
                                onClick={() => router.push('/login')}
                                styles={softButtonStyles}
                            >
                                Voltar para login
                            </Button>
                        </Group>
                    </Stack>
                ) : (
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <TextInput
                            label="E-mail"
                            placeholder="Seu e-mail"
                            {...form.getInputProps('email')}
                            styles={authInputStyles}
                            required
                        />
                        <Group mt="md" grow>
                            <Button
                                variant="default"
                                leftSection={<IconLogin size={18}/>}
                                onClick={() => router.push('/login')}
                                type="button"
                                styles={softButtonStyles}
                            >
                                Voltar
                            </Button>
                            <Button
                                type="submit"
                                loading={loading}
                                leftSection={<IconMailForward size={18}/>}
                                styles={primaryButtonStyles}
                            >
                                Enviar link
                            </Button>
                        </Group>
                    </form>
                )}
            </Stack>
        </HomeBaseLayout>
    );
};

export default ResetPasswordPage;