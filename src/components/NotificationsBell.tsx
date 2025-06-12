import {ActionIcon, Badge, Box, Button, Group, Loader, Menu, ScrollArea, Text} from '@mantine/core';
import {IconBell, IconEye} from '@tabler/icons-react';
import {useNotifications} from '@/contexts/NotificationContext';
import {AnimatedTargetDot} from "@/components/AnimatedTargetDot";
import {truncate} from "@/lib/utils";

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

    return (
        <Menu width={350} position="bottom-end" withArrow>
            <Menu.Target>
                <ActionIcon size="lg" variant="subtle">
                    <IconBell size={22}/>
                    {unreadCount > 0 && (
                        <Badge color="red" size="sm" style={{position: 'absolute', top: 2, right: 2}}>
                            {unreadCount}
                        </Badge>
                    )}
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Group justify="space-between" px="sm" py={4}>
                    <Text fw={500}>Notificações</Text>
                    <Text size="xs" color="blue" style={{cursor: 'pointer'}} onClick={markAllAsRead}>
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
                                    border: `1px solid var(--mantine-color-${color}-4)`,
                                    borderRadius: 8,
                                    background: n.is_read ? '#f8fafc' : '#e3f2fd'
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
                                                color="blue"
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