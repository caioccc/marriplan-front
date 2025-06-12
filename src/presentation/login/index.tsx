import type {NextPage} from 'next'
import {useState} from 'react'
import {Button, Group, PasswordInput, Text, TextInput, Divider, Anchor} from '@mantine/core';
import {IconLogin, IconUserPlus} from '@tabler/icons-react';
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout'
import {useAuth} from '@/contexts/AuthContext'
import {useToast} from "@/hooks/use-toast"
import {useRouter} from 'next/router'
import {useForm, zodResolver} from '@mantine/form';
import {z} from 'zod';
import {useTranslation} from 'react-i18next';
import {GoogleLoginButton} from '@/components/GoogleLoginButton';

const LoginContent: NextPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const {login} = useAuth()
    const {toast} = useToast()
    const {t} = useTranslation();

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
        login(values)
            .then((data) => {
                setIsLoading(false);
                if (data.require_2fa) {
                    sessionStorage.setItem('2fa_email', values.email);
                    sessionStorage.setItem('2fa_password', values.password);
                    router.push({pathname: '/2fa'});
                    return;
                }
                toast({title: t('login.login_success')});
                router.push('/dashboard');
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
        <HomeBaseLayout title={t('login.page_title')}>
            <form onSubmit={form.onSubmit(handleLogin)}>
                <TextInput
                    label={t('login.email')}
                    placeholder={t('login.email_placeholder')}
                    {...form.getInputProps('email')}
                    required
                />

                <PasswordInput
                    label={t('login.password')}
                    placeholder={t('login.password_placeholder')}
                    mt="md"
                    {...form.getInputProps('password')}
                    required
                />

                <Group justify="center" mt="xl">
                    <Button
                        leftSection={<IconUserPlus size={18}/>}
                        variant="outline"
                        color="gray"
                        onClick={goToRegister}
                    >
                        {t('login.register')}
                    </Button>
                    <Button
                        rightSection={<IconLogin size={18}/>}
                        variant="filled"
                        color="blue"
                        type="submit"
                        loading={isLoading}
                    >
                        {t('login.login')}
                    </Button>
                </Group>
            </form>

            <Divider label={t('login.or_social')} my="lg"/>

            <Group justify="center">
                <GoogleLoginButton/>
            </Group>

            <Text size="sm" mt={16} className="mt-8 text-center text-gray-500">
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
                    width: 'fit-content'
                }}
            >
                Esqueci minha senha
            </Anchor>
        </HomeBaseLayout>
    )
}

export default LoginContent