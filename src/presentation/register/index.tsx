import type {NextPage} from 'next'
import {useState} from 'react'
import {Button, Group, PasswordInput, Stack, TextInput} from '@mantine/core'
import {hasLength, isEmail, isNotEmpty, useForm} from '@mantine/form'
import {IconArrowBackUp, IconUserPlus} from '@tabler/icons-react'
import {useRouter} from 'next/router'
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout'
import {useAuth} from '@/contexts/AuthContext'
import {useToast} from '@/hooks/use-toast'
import {useTranslation} from 'react-i18next'
import {authInputStyles, primaryButtonStyles, softButtonStyles} from '@/styles/marriplanStyles'

type FormValues = {
    name: string
    email: string
    password: string
    confirm_password: string
}

const RegisterContent: NextPage = () => {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const {register} = useAuth()
    const {toast} = useToast()
    const {t} = useTranslation()

    const form = useForm<FormValues>({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirm_password: '',
        },
        validate: {
            name: (value) =>
                isNotEmpty(t('register.name_required'))(value) ||
                hasLength({min: 2, max: 50}, t('register.name_length'))(value),
            email: (value) =>
                isNotEmpty(t('register.email_required'))(value) ||
                isEmail(t('register.email_invalid'))(value),
            password: (value) =>
                isNotEmpty(t('register.password_required'))(value) ||
                hasLength({min: 6}, t('register.password_length'))(value),
            confirm_password: (value, values) =>
                isNotEmpty(t('register.confirm_password_required'))(value) ||
                (value !== values.password && t('register.passwords_not_match')),
        },
    })

    const handleRegister = (values: FormValues) => {
        setIsLoading(true)
        register({
            name: values.name,
            email: values.email,
            password: values.password
        })
            .then(() => {
                toast({
                    title: t('register.success_title'),
                })
                router.push('/register/check-email')
            })
            .catch((error) => {
                console.error(error)
                const status = error?.response?.status
                const isServerError = !error?.response || status === 500
                toast({
                    title: t('register.error_title'),
                    description: isServerError
                        ? <p>{t('register.server_error')}</p>
                        : <p>{t('register.data_error')}</p>,
                })
            })
            .finally(() => setIsLoading(false))
    }

    const goToLogin = () => {
        router.push('/login')
    }

    return (
        <HomeBaseLayout
            title={t('register.title')}
            description="Crie seu acesso na plataforma."
        >
            <form onSubmit={form.onSubmit(handleRegister)}>
                <Stack gap="md">
                    <TextInput
                        label={t('register.name_label')}
                        placeholder={t('register.name_placeholder')}
                        required
                        {...form.getInputProps('name')}
                        styles={authInputStyles}
                    />

                    <TextInput
                        label={t('register.email_label')}
                        placeholder={t('register.email_placeholder')}
                        required
                        {...form.getInputProps('email')}
                        styles={authInputStyles}
                    />

                    <PasswordInput
                        label={t('register.password_label')}
                        placeholder={t('register.password_placeholder')}
                        required
                        {...form.getInputProps('password')}
                        styles={authInputStyles}
                    />

                    <PasswordInput
                        label={t('register.confirm_password_label')}
                        placeholder={t('register.confirm_password_placeholder')}
                        required
                        {...form.getInputProps('confirm_password')}
                        styles={authInputStyles}
                    />
                </Stack>

                <Group justify="center" mt="xl" grow>
                    <Button
                        leftSection={<IconArrowBackUp size={18}/>} 
                        variant="default"
                        onClick={goToLogin}
                        styles={softButtonStyles}
                    >
                        {t('register.back_to_login')}
                    </Button>
                    <Button
                        leftSection={<IconUserPlus size={18}/>} 
                        type="submit"
                        variant="filled"
                        loading={isLoading}
                        styles={primaryButtonStyles}
                    >
                        {t('register.submit')}
                    </Button>
                </Group>
            </form>
        </HomeBaseLayout>
    )
}

export default RegisterContent