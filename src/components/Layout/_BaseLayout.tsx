import { AppShell, Avatar, Box, Burger, Group, Menu, NavLink, Title, Progress, Text, ThemeIcon, Indicator } from '@mantine/core';
import {
    IconBell,
    IconChevronDown,
    IconCreditCard,
    IconLogout,
    IconMessageCircle,
    IconReportAnalytics,
    IconSettings,
    IconUser,
    IconCheck,
    IconAlertCircle,
    IconUserCheck,
    IconHome,
    IconHome2,
    IconWorldWww,
    IconChecklist,
    IconGift
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDisclosure } from '@mantine/hooks';
import { SettingsModal } from "@/components/SettingsModal";
import { ProfileModal } from "@/components/ProfileModal";
import { NotificationsBell } from "@/components/NotificationsBell";
import WeddingProfileOnboardingModal from '@/components/WeddingProfileOnboardingModal';

interface BaseLayoutProps {
    children: ReactNode;
}

export default function BaseLayout({ children }: Readonly<BaseLayoutProps>) {
    const router = useRouter();
    const { logout, user } = useAuth();
    // Altere o valor inicial de opened para true para manter o menu sempre aberto
    const [opened, { toggle }] = useDisclosure(true);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

    const handleLogout = async () => {
        logout();
        router.push('/login');
    };

    // Cálculo do progresso do perfil de casamento
    let profileProgress = 0;
    const requiredFields = [
        { key: 'nome_noivo', label: 'Nome do noivo' },
        { key: 'nome_noiva', label: 'Nome da noiva' },
        { key: 'data_casamento', label: 'Data do casamento' },
        { key: 'hora_casamento', label: 'Hora do casamento' },
        { key: 'local', label: 'Local' },
    ];
    let filled = 0;
    const completedFields: string[] = [];
    const missingFields: string[] = [];
    if (user?.wedding_profile) {
        const p = user.wedding_profile;
        requiredFields.forEach(field => {
            if (p[field.key]) {
                filled++;
                completedFields.push(field.label);
            } else {
                missingFields.push(field.label);
            }
        });
        profileProgress = Math.round((filled / requiredFields.length) * 100);
    } else {
        profileProgress = 0;
    }

    return (

        <AppShell
            padding="xs"
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { desktop: !opened, mobile: !opened },
            }}
        >
            <AppShell.Header p="md">
                <Group justify="space-between" w="100%">
                    {/* Logo à esquerda */}
                    <Group>
                        <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
                        <Title order={3} m={0}>
                            Marriplan
                        </Title>
                    </Group>

                    {/* Ícones e menu à direita */}
                    <Group>
                        <NotificationsBell />
                        <Menu shadow="md" width={280} position="bottom-end" withArrow>
                            <Menu.Target>
                                <Indicator color={profileProgress === 100 ? 'green' : 'yellow'} size={10} offset={4} processing={profileProgress < 100}>
                                    <Group gap={4} style={{ cursor: 'pointer' }}>
                                        <ThemeIcon color={profileProgress === 100 ? 'green' : 'yellow'} variant="light" size="lg">
                                            <IconUserCheck size={20} />
                                        </ThemeIcon>
                                        {
                                            profileProgress !== 100 && (
                                                <>
                                                    <Text size="sm" fw={500} c={profileProgress === 100 ? 'green' : 'yellow.8'}>
                                                        Perfil {profileProgress}%
                                                    </Text>
                                                    <IconChevronDown size={16} />
                                                </>
                                            )
                                        }
                                    </Group>
                                </Indicator>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Box p="xs">
                                    <Text size="sm" fw={600} mb={4}>Progresso do perfil de casamento</Text>
                                    <Progress value={profileProgress} color={profileProgress === 100 ? 'green' : 'yellow'} size="md" radius="xl" mb={8} />
                                    <Text size="xs" c="dimmed" mb={6}>
                                        Complete todos os campos obrigatórios para liberar todos os recursos do Marriplan.
                                    </Text>
                                    <Box>
                                        {requiredFields.map(field => (
                                            <Group key={field.key} gap={6} align="center" mb={2}>
                                                {user?.wedding_profile?.[field.key] ? (
                                                    <ThemeIcon color="green" size={18} radius="xl" variant="light"><IconCheck size={14} /></ThemeIcon>
                                                ) : (
                                                    <ThemeIcon color="yellow" size={18} radius="xl" variant="light"><IconAlertCircle size={14} /></ThemeIcon>
                                                )}
                                                <Text size="sm" c={user?.wedding_profile?.[field.key] ? 'green' : 'yellow.8'}>
                                                    {field.label}
                                                </Text>
                                            </Group>
                                        ))}
                                    </Box>
                                </Box>
                            </Menu.Dropdown>
                        </Menu>
                        <Menu shadow="md" width={200} position="bottom-end" withArrow>
                            <Menu.Target>
                                <Group gap="xs" style={{ cursor: 'pointer' }}>
                                    <Avatar radius="xl" size="md" />
                                    <IconChevronDown size={16} />
                                </Group>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>Conta</Menu.Label>
                                <Menu.Item leftSection={<IconUserCheck size={16} />} onClick={() => setOnboardingModalOpen(true)}>
                                    Meus dados
                                </Menu.Item>
                                <Menu.Item leftSection={<IconUser size={16} />} onClick={() => setProfileModalOpen(true)}>
                                    Meu Perfil
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconSettings size={16} />}
                                    onClick={() => setSettingsModalOpen(true)}>
                                    Configurações
                                </Menu.Item>
                                <Menu.Item leftSection={<IconCreditCard size={16} />}>Pagamento</Menu.Item>
                                <Menu.Divider />
                                <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                                    Sair
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            <ProfileModal opened={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
            <WeddingProfileOnboardingModal
                opened={onboardingModalOpen}
                onClose={() => setOnboardingModalOpen(false)}
                onComplete={() => setOnboardingModalOpen(false)}
            />

            <SettingsModal
                opened={settingsModalOpen}
                onClose={() => {
                    setSettingsModalOpen(false);
                }}
            />

            <AppShell.Navbar withBorder p="xs" style={{ width: 250, overflowY: 'auto' }}>
                <NavLink
                    label="Início"
                    leftSection={<IconHome2 size={18} />} // Ícone de dashboard
                    active={router.pathname === '/dashboard'}
                    onClick={() => router.push('/dashboard')}
                />
                <NavLink
                    label="Checklist de Casamento"
                    leftSection={<IconChecklist size={18} />} // Ícone de checklist
                    active={router.pathname === '/checklist'}
                    onClick={() => router.push('/checklist')}
                />
                <NavLink
                    label="Meus Convidados"
                    leftSection={<IconUser size={18} />} // Ícone de usuário
                    active={router.pathname === '/guests'}
                    onClick={() => router.push('/guests')}
                />
                  <NavLink
                    label="Lista de Presentes"
                    leftSection={<IconGift size={18} />} // Ícone de presente
                    active={router.pathname === '/gifts'}
                    onClick={() => router.push('/gifts')}
                />
                <NavLink
                    label="Chat"
                    leftSection={<IconMessageCircle size={18} />} // Ícone de chat
                    active={router.pathname === '/chat'}
                    onClick={() => router.push('/chat')}
                />

                <NavLink
                    label="Meu Site"
                    leftSection={<IconWorldWww size={18}/>} // Ícone de casa
                >
                    <NavLink label="Configuração do Site" onClick={() => router.push('/meu-site')} />
                    <NavLink label="Histórico de Atualizações" onClick={() => router.push('/meu-site/historico')} />
                    <NavLink label="Domínio Personalizado" onClick={() => router.push('/meu-site/dominio')} disabled />
                </NavLink>

                 <NavLink
                    label="Notificações"
                    leftSection={<IconBell size={18} />}
                    active={router.pathname === '/notifications'}
                    onClick={() => router.push('/notifications')}
                />
                <NavLink
                    label="Relatórios"
                    leftSection={<IconReportAnalytics size={18} />}
                    active={router.pathname === '/reports'}
                    onClick={() => router.push('/reports')}
                />

                <NavLink
                    label="Sair"
                    leftSection={<IconLogout size={18} />}
                    color="red"
                    onClick={handleLogout}
                />

            </AppShell.Navbar>

            <AppShell.Main
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box style={{ width: '100%' }}>
                    {children}
                </Box>
            </AppShell.Main>

            {/*<AppShell.Footer p="md" withBorder style={{height: 50}}>*/}
            {/*    <Text ta="center" size="sm" color="dimmed">*/}
            {/*        Marriplan @ {getCurrentYear()}*/}
            {/*    </Text>*/}
            {/*</AppShell.Footer>*/}
            {/* Conteúdo principal */}

        </AppShell>
    );
}
