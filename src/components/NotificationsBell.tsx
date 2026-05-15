import {ActionIcon, Badge, Box, Button, Group, Loader, Menu, ScrollArea, Text} from '@mantine/core';
import {IconBell, IconEye} from '@tabler/icons-react';
import {useNotifications} from '@/contexts/NotificationContext';
import {AnimatedTargetDot} from "@/components/AnimatedTargetDot";
import {truncate} from "@/lib/utils";
import { actionIconStyles } from '@/styles';

export function NotificationsBell() {
    const {
        notifications,
        unreadCount,
        loading,
        hasMore,
        fetchMore,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    const menuStyles = {
        dropdown: {
            borderRadius: 16,
            border: '1px solid var(--marriplan-border)',
            background: 'var(--marriplan-surface)',
            boxShadow: 'var(--marriplan-shadow)',
        },
        item: {
            borderRadius: 10,
            transition: 'all 140ms ease',
            '&[data-hovered]': {
                backgroundColor: 'rgba(242, 230, 216, 0.6)',
            },
        },
    } as const;

    return (
        <Menu width={360} position="bottom-end" withArrow styles={menuStyles}>
            <Menu.Target>
                <ActionIcon size="lg" variant="subtle" styles={actionIconStyles} style={{ position: 'relative', backgroundColor: 'var(--marriplan-surface-muted)', color: 'var(--marriplan-rose)' }}>
                    <IconBell size={22} />
                    {unreadCount > 0 && (
                        <Badge color="red" size="sm" style={{position: 'absolute', top: 2, right: 2, backgroundColor: 'var(--marriplan-rose)', color: '#fff'}}>
                            {unreadCount}
                        </Badge>
                    )}
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Group justify="space-between" px="sm" py={4}>
                    <Text fw={500}>Notificações</Text>
                    <Text size="xs" style={{cursor: 'pointer', color: 'var(--marriplan-rose)'}} onClick={markAllAsRead}>
                        Marcar todas como lida
                    </Text>
                </Group>
                <ScrollArea  h={300}>
                    {loading && <Loader size="sm"/>}
                    {notifications.length === 0 && <Text align="center" c="dimmed">Sem notificações</Text>}
                    {notifications.map(n => {
                        const color =
                            n.type === 'success' ? 'green' :
                                n.type === 'error' ? 'red' :
                                    n.type === 'warning' ? 'yellow' :
                                        'blue';

                        return (
                            <Box
                                key={n.id}
                                p="xs"
                                mb="xs"
                                style={{
                                    border: '1px solid var(--marriplan-border)',
                                    borderRadius: 12,
                                    background: n.is_read ? 'var(--marriplan-surface)' : 'var(--marriplan-surface-muted)',
                                    boxShadow: n.is_read ? 'none' : '0 12px 24px rgba(70, 56, 43, 0.06)'
                                }}
                            >
                                <Group justify="space-between" align="flex-start">
                                    <div>
                                        <Text fw={600}
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}
                                        >{truncate(n.title, 150)}</Text>
                                        <Text size="sm" c="dimmed" style={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}>{truncate(n.message, 150)}</Text>
                                        {/*<Text size="xs" c="dimmed" mt={4}>*/}
                                        {/*    {new Date(n.created_at).toLocaleString()}*/}
                                        {/*</Text>*/}
                                    </div>
                                </Group>
                                <Group justify="space-between" mt={6}>
                                    <AnimatedTargetDot color={color} />
                                    <Group gap="xs">
                                        {!n.is_read && (
                                            <Button
                                                size="xs"
                                                variant="light"
                                                style={{ color: 'var(--marriplan-rose)' }}
                                                leftSection={<IconEye size={16} />}
                                                onClick={() => markAsRead(n.id)}
                                            >
                                                Marcar como lida
                                            </Button>
                                        )}
                                    </Group>
                                </Group>
                            </Box>
                        );
                    })}
                    {hasMore && (
                        <Box ta="center" mt="md" mb="md">
                            <Button size="xs" variant="light" onClick={fetchMore}>
                                Carregar mais
                            </Button>
                        </Box>
                    )}
                </ScrollArea>
            </Menu.Dropdown>
        </Menu>
    );
}