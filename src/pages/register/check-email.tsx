import {Button, Paper, Text} from '@mantine/core';
import {useRouter} from 'next/router';
import HomeBaseLayout from '@/components/Layout/_HomeBaseLayout';
import {useTranslation} from 'react-i18next';

const CheckEmailPage = () => {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <HomeBaseLayout title={t('check_email.title')}>
            <Paper p="lg" radius="md" withBorder mt="xl" style={{maxWidth: 400, margin: '0 auto'}}>
                <Text mb="md">
                    {t('check_email.instructions')}
                </Text>
                <Text mb="md" color="orange" fw={400}>
                    {t('check_email.attention')}
                </Text>
                <Button color="blue" onClick={() => router.push('/login')} fullWidth>
                    {t('check_email.go_to_login')}
                </Button>
            </Paper>
        </HomeBaseLayout>
    );
};

export default CheckEmailPage;