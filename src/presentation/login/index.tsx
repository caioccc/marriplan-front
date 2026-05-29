import type {NextPage} from 'next'
import {useEffect, useState} from 'react'
import {Anchor, Button, Divider, Group, PasswordInput, Stack, Text, TextInput} from '@mantine/core';
import {IconLogin, IconUserPlus} from '@tabler/icons-react';
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout'
import {useAuth} from '@/contexts/AuthContext'
import {useToast} from "@/hooks/use-toast"
import {useRouter} from 'next/router'
import {useForm, zodResolver} from '@mantine/form';
import {z} from 'zod';
import {useTranslation} from 'react-i18next';
import {GoogleLoginButton} from '@/components/GoogleLoginButton';
import {authInputStyles, primaryButtonStyles, softButtonStyles} from '@/styles/marriplanStyles';

const LoginContent: NextPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const {login} = useAuth()
    const {toast} = useToast()
    const {t} = useTranslation();

    useEffect(() => {
        if (!router.isReady) {
            return
        }

        if (router.query.reason === 'session_expired') {
            toast({
                title: 'Sua sessão expirou',
                description: <p>Faça login novamente para continuar.</p>,
            })

            const query = { ...router.query }
            delete query.reason
            router.replace(
                {
                    pathname: '/login',
                    query,
                },
                undefined,
                { shallow: true }
            )
        }
    }, [router, toast])

    const schema = z.object({
        email: z.string().email({message: t('login.email_invalid')}),
        password: z.string().min(6, {message: t('login.password_min')}),
    });

    type FormValues = z.infer<typeof schema>;

    const form = useForm<FormValues>({
        validate: zodResolver(schema),
        initialValues: {
            email: '',
            password: '',
        },
    });

    const handleLogin = (values: FormValues) => {
        setIsLoading(true);
        // clean all localStorage
        localStorage.clear();
        login(values)
            .then((data) => {
                setIsLoading(false);
                if (data.require_2fa) {
                    localStorage.setItem('2fa_email', values.email);
                    localStorage.setItem('2fa_password', values.password);
                    router.push({pathname: '/2fa'});
                    return;
                }
                toast({title: t('login.login_success')});
                if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem('marriplan:trial-modal-seen');
                }
                const redirect = typeof router.query.redirect === 'string' ? router.query.redirect : '/dashboard'
                router.push(redirect || '/dashboard');
            })
            .catch(() => {
                setIsLoading(false);
                toast({title: t('login.login_error_title'), description: <p>Usuário ou senha incorretos!</p>});
            });
    };

    const goToRegister = () => {
        router.push('/register')
    }

    return (
        <HomeBaseLayout
            title={t('login.page_title')}
            description="Entre com sua conta para continuar com a experiência Marriplan."
        >
            <form onSubmit={form.onSubmit(handleLogin)}>
                <Stack gap="md">
                    <TextInput
                        label={t('login.email')}
                        placeholder={t('login.email_placeholder')}
                        {...form.getInputProps('email')}
                        styles={authInputStyles}
                        required
                    />

                    <PasswordInput
                        label={t('login.password')}
                        placeholder={t('login.password_placeholder')}
                        {...form.getInputProps('password')}
                        styles={authInputStyles}
                        required
                    />
                </Stack>

                <Group justify="center" mt="xl" grow>
                    <Button
                        leftSection={<IconUserPlus size={18}/>} 
                        variant="default"
                        onClick={goToRegister}
                        styles={softButtonStyles}
                    >
                        {t('login.register')}
                    </Button>
                    <Button
                        rightSection={<IconLogin size={18}/>} 
                        variant="filled"
                        type="submit"
                        loading={isLoading}
                        styles={primaryButtonStyles}
                    >
                        {t('login.login')}
                    </Button>
                </Group>
            </form>

            <Divider label={t('login.or_social')} my="lg" labelPosition="center" styles={{ label: { color: 'var(--marriplan-muted)' } }} />

            <Group justify="center">
                <GoogleLoginButton/>
            </Group>

            <Text size="sm" mt="md" ta="center" style={{ color: 'var(--marriplan-muted)' }}>
                {t('login.or_create_account')}
            </Text>
            <Anchor
                component="button"
                type="button"
                onClick={() => router.push('/reset-password')}
                mt="md"
                style={{
                    display: 'block',
                    textAlign: 'center',
                    margin: '16px auto 0 auto',
                    width: 'fit-content',
                    color: 'var(--marriplan-rose)',
                    fontWeight: 600,
                }}
            >
                Esqueci minha senha
            </Anchor>
        </HomeBaseLayout>
    )
}

export default LoginContent