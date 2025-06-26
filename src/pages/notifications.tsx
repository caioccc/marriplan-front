import {useEffect, useState} from 'react';
import {DataTable} from 'mantine-datatable';
import {Button, Group, Box, Text, Title} from '@mantine/core';
import BaseLayout from "@/components/Layout/_BaseLayout";
import {AnimatedTargetDot} from "@/components/AnimatedTargetDot";
import {IconBell, IconEye, IconEyeOff, IconTrash} from '@tabler/icons-react';
import {
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markAllAsUnread,
    removeNotification,
    removeAllNotifications
} from '@/services/notifications';
import {PAGE_SIZE, PAGES_SIZES, truncate} from "@/lib/utils";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [total, setTotal] = useState(0);

    const loadNotifications = async () => {
        setLoading(true);
        const data = await fetchNotifications(page, pageSize);
        setNotifications(data.results);
        setTotal(data.count);
        setLoading(false);
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
    };

    const handleMarkAsUnread = async (id) => {
        await markAsUnread(id);
        setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: false} : n));
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({...n, is_read: true})));
    };

    const handleMarkAllAsUnread = async () => {
        await markAllAsUnread();
        setNotifications(prev => prev.map(n => ({...n, is_read: false})));
    };

    const handleRemoveNotification = async (id) => {
        await removeNotification(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleRemoveAll = async () => {
        await removeAllNotifications();
        setNotifications([]);
    };

    const getColor = (type) => {
        return type === 'success' ? 'green' :
            type === 'error' ? 'red' :
                type === 'warning' ? 'yellow' :
                    'blue';
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await fetchNotifications(page, pageSize);
            setNotifications(data.results);
            setTotal(data.count);
            setLoading(false);
        };
        fetchData();

    }, [page, pageSize]);

    return (
        <BaseLayout>
            <Group mb="md" align="center">
                <IconBell size={28} style={{marginRight: 8}}/>
                <Title order={2}>Notificações</Title>
            </Group>
            <Box style={{display: 'flex', flexDirection: 'column', padding: '1rem', width: '100%'}}>
                <Group mb="md">
                    <Button leftSection={<IconEye size={16}/>} onClick={handleMarkAllAsRead}>
                        Marcar todas como lida
                    </Button>
                    <Button leftSection={<IconEyeOff size={16}/>} onClick={handleMarkAllAsUnread}>
                        Marcar todas como não lida
                    </Button>
                </Group>
                <Box style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                    <DataTable
                        columns={[
                            {
                                accessor: 'type',
                                title: 'Tipo',
                                render: n => <AnimatedTargetDot color={getColor(n.type)}/>
                            },
                            {
                                accessor: 'title',
                                title: 'Título',
                                render: n => (
                                    <Text style={n.is_read ? {textDecoration: 'line-through', color: '#adb5bd'} : {}}>
                                        {truncate(n.title, 30)}
                                    </Text>
                                )
                            },
                            {
                                accessor: 'message',
                                title: 'Mensagem',
                                render: n => (
                                    <Text style={n.is_read ? {textDecoration: 'line-through', color: '#adb5bd'} : {}}>
                                        {truncate(n.message, 30)}
                                    </Text>
                                )
                            },
                            {
                                accessor: 'created_at',
                                title: 'Data/Hora',
                                render: n => new Date(n.created_at).toLocaleString()
                            },
                            {
                                accessor: 'actions',
                                title: 'Ações',
                                render: n => (
                                    <Group spacing="compact-xs" >
                                        {n.is_read ? (
                                            <Button size="compact-xs" variant="subtle" onClick={() => handleMarkAsUnread(n.id)}>
                                                <IconEyeOff size={18}/>
                                            </Button>
                                        ) : (
                                            <Button size="compact-xs" variant="subtle" onClick={() => handleMarkAsRead(n.id)}>
                                                <IconEye size={18}/>
                                            </Button>
                                        )}
                                        <Button size="compact-xs" color="red" variant="subtle"
                                                onClick={() => handleRemoveNotification(n.id)}>
                                            <IconTrash size={18}/>
                                        </Button>
                                    </Group>
                                )
                            }
                        ]}
                        records={notifications}
                        withBorder
                        highlightOnHover
                        fetching={loading}
                        totalRecords={total}
                        recordsPerPage={PAGE_SIZE}
                        page={page}
                        onPageChange={setPage}
                        // recordsPerPageOptions={PAGES_SIZES}
                        // onRecordsPerPageChange={setPageSize}
                        // recordsPerPageLabel={'Itens por página'}
                        noRecordsText={'Nenhuma notificação encontrada'}
                        paginationText={({from, to, totalRecords}) =>
                            `${from} - ${to} de ${totalRecords} itens`
                        }
                    />
                </Box>
            </Box>
        </BaseLayout>
    );
}