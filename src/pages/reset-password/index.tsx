import {useState} from 'react';
import {Button, Group, Paper, Text, TextInput, ThemeIcon} from '@mantine/core';
import {IconCheck, IconLogin, IconMailForward, IconRefresh, IconX} from '@tabler/icons-react';
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout';
import {isEmail, isNotEmpty, useForm} from '@mantine/form';
import {sendResetPasswordEmail} from '@/services/user';
import {useTranslation} from 'react-i18next';
import {useRouter} from 'next/router';

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
        <HomeBaseLayout title="Alterar senha">
            <Paper p="lg" radius="md" withBorder mt="xl" style={{maxWidth: 400, margin: '0 auto'}}>
                <Text mb="md" size="sm" color="dimmed">
                    Informe seu e-mail para receber um link de redefinição de senha. Caso o e-mail informado exista em nossa base, você receberá as instruções.
                </Text>
                {sent ? (
                    <Group align="center" spacing="sm" style={{flexDirection: 'column'}}>
                        <ThemeIcon color="green" size="lg" radius="xl">
                            <IconCheck size={20}/>
                        </ThemeIcon>
                        <Text>
                            Se o e-mail informado existir, você receberá um link para redefinir sua senha.
                        </Text>
                        <Button
                            mt="md"
                            color="blue"
                            variant="outline"
                            leftSection={<IconLogin size={18}/>}
                            onClick={() => router.push('/login')}
                        >
                            Voltar para login
                        </Button>
                    </Group>
                ) : error ? (
                    <Group align="center" spacing="sm" style={{flexDirection: 'column'}}>
                        <ThemeIcon color="red" size="lg" radius="xl">
                            <IconX size={20}/>
                        </ThemeIcon>
                        <Text color="red">{error}</Text>
                        <Group mt="md">
                            <Button
                                color="blue"
                                variant="outline"
                                leftSection={<IconRefresh size={18}/>}
                                onClick={handleTryAgain}
                            >
                                Tentar novamente
                            </Button>
                            <Button
                                color="gray"
                                variant="outline"
                                leftSection={<IconLogin size={18}/>}
                                onClick={() => router.push('/login')}
                            >
                                Voltar para login
                            </Button>
                        </Group>
                    </Group>
                ) : (
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <TextInput
                            label="E-mail"
                            placeholder="Seu e-mail"
                            {...form.getInputProps('email')}
                            required
                        />
                        <Group mt="md" grow>
                            <Button
                                color="gray"
                                variant="outline"
                                leftSection={<IconLogin size={18}/>}
                                onClick={() => router.push('/login')}
                                type="button"
                            >
                                Voltar
                            </Button>
                            <Button
                                type="submit"
                                color="blue"
                                loading={loading}
                                leftSection={<IconMailForward size={18}/>}
                            >
                                Enviar link
                            </Button>
                        </Group>
                    </form>
                )}
            </Paper>
        </HomeBaseLayout>
    );
};

export default ResetPasswordPage;