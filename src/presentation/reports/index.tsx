import type {NextPage} from 'next';
import {Card, SimpleGrid, Text, Title} from '@mantine/core';
import {useAuth} from '@/contexts/AuthContext';
import {useEffect, useState} from 'react';
import {getTotalConversations, getTotalSessions} from "@/services/dashboard";
import {useToast} from "@/hooks/use-toast";
import BaseLayout from "@/components/Layout/_BaseLayout";

const ReportsContent: NextPage = () => {
    const {user} = useAuth();

    const {toast} = useToast();

    const [totalSessions, setTotalSessions] = useState<number | null>(null);
    const [totalConversations, setTotalConversations] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [sessions, conversations] = await Promise.all([
                getTotalSessions(),
                getTotalConversations(),
            ]);

            if (sessions.status !== 200) {
                toast({
                    description: (
                        <>
                            <p>Erro ao buscar total de sessões</p>
                        </>
                    ),
                });
                return;
            }

            if (conversations.status !== 200) {
                toast({
                    description: (
                        <>
                            <p>Erro ao buscar total de conversas</p>
                        </>
                    ),
                });
                return;
            }

            if (sessions.status == 200 && conversations.status == 200) {
                setTotalSessions(sessions.data.length);
                setTotalConversations(conversations.data.length);
            }

        };
        fetchData();
    }, []);

    return (
        <BaseLayout title="Relatórios">
            <Title order={2} mb="md">
                Bem-vindo, {user?.username ?? 'Usuário'}!
            </Title>

            <SimpleGrid cols={{base: 1, sm: 2}} spacing="lg">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text size="lg" fw={700}>Total de Sessões</Text>
                    <Text size="xl">{totalSessions ?? 'Carregando...'}</Text>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Text size="lg" fw={700}>Total de Conversas</Text>
                    <Text size="xl">{totalConversations ?? 'Carregando...'}</Text>
                </Card>
            </SimpleGrid>
        </BaseLayout>
    );
};

export default ReportsContent;
