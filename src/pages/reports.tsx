import ReportsContent from '@/presentation/reports'
import { NextPage } from 'next'
import { IconReportAnalytics } from '@tabler/icons-react';
import { Group, Title } from '@mantine/core';


const Page: NextPage = () => {
    return (
        <>
            <Group mb="md" align="center">
                <IconReportAnalytics size={28} style={{ marginRight: 8 }} />
                <Title order={2}>Relatórios</Title>
            </Group>
            <ReportsContent />
        </>
    );
}

export default Page
