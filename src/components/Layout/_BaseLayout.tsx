import { NotificationsBell } from "@/components/NotificationsBell";
import { ProfileModal } from "@/components/ProfileModal";
import { SettingsModal } from "@/components/SettingsModal";
import { useAuth } from '@/contexts/AuthContext';
import { AppShell, Avatar, Box, Burger, Group, Indicator, Menu, NavLink, Progress, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
    IconAlertCircle,
    IconBell,
    IconCheck,
    IconChecklist,
    IconChevronDown,
    IconCreditCard,
    IconGift,
    IconHome2,
    IconLogout,
    IconReportAnalytics,
    IconSettings,
    IconUser,
    IconUserCheck,
    IconWorldWww
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';

interface BaseLayoutProps {
    children: ReactNode;
}

export default function BaseLayout({ children }: Readonly<BaseLayoutProps>) {
    const router = useRouter();
    const { logout, user } = useAuth();
    // Altere o valor inicial de opened para true para manter o menu sempre aberto
    const [opened, { toggle }] = useDisclosure(true);
    // const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    const isMobile = useMediaQuery('(max-width: 768px)');

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

    const progressTone = profileProgress === 100 ? 'var(--marriplan-rose)' : 'var(--marriplan-gold)';
    const navLinkStyles = {
        root: {
            borderRadius: 12,
            padding: '10px 12px',
            color: 'var(--marriplan-text)',
            transition: 'all 180ms ease',
            fontWeight: 500,
            '&:hover': {
                backgroundColor: 'rgba(242, 230, 216, 0.6)',
            },
            '&[data-active]': {
                background: 'linear-gradient(90deg, #f6eee4 0%, #fbf7f2 100%)',
                boxShadow: 'inset 0 0 0 1px var(--marriplan-border)',
            },
        },
        label: {
            fontWeight: 500,
            letterSpacing: '0.01em',
        },
        section: {
            color: 'var(--marriplan-muted)',
        },
    } as const;
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
        label: {
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--marriplan-muted)',
        },
    } as const;

    return (
        <AppShell
            padding="md"
            header={{ height: 60 }}
            navbar={{ width: 248, breakpoint: 'sm', collapsed: { mobile: !opened, desktop: !opened } }}
            styles={{
                main: {
                    background: 'var(--marriplan-bg)',
                    minHeight: '100vh',
                },
            }}
        >
            <AppShell.Header
                p="md"
                style={{
                    background: 'rgba(255, 251, 247, 0.9)',
                    borderBottom: '1px solid var(--marriplan-border)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Group justify="space-between" w="100%">
                    {/* Logo à esquerda */}
                    <Group>
                        {
                            isMobile && (
                                <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
                            )
                        }
                        <Title
                            order={2}
                            style={{
                                color: 'var(--marriplan-text)',
                                fontFamily: '"Montserrat", "Manrope", sans-serif',
                                letterSpacing: '0.02em',
                            }}
                        >
                            <Group gap="xs">
                                {
                                    !isMobile && (
                                        <img
                                            src="/logo-marri.png"
                                            alt="Logo Marriplan"
                                            width={32}
                                            height={32}
                                            style={{ cursor: 'pointer', borderRadius: 10, boxShadow: '0 8px 18px rgba(70, 56, 43, 0.14)' }}
                                            onClick={toggle}
                                        />
                                    )
                                }
                                Marriplan
                            </Group>
                        </Title>
                    </Group>


                    {/* Ícones e menu à direita */}
                    <Group>
                        <NotificationsBell />
                        <Menu shadow="xl" width={300} position="bottom-end" withArrow styles={menuStyles}>
                            <Menu.Target>
                                <Indicator
                                    color={progressTone}
                                    size={10}
                                    offset={4}
                                    processing={profileProgress < 100}
                                >
                                    <Group gap={4} style={{ cursor: 'pointer' }}>
                                        <ThemeIcon
                                            variant="light"
                                            size="lg"
                                            style={{
                                                backgroundColor: 'var(--marriplan-champagne)',
                                                color: 'var(--marriplan-rose)',
                                            }}
                                        >
                                            <IconUserCheck size={20} />
                                        </ThemeIcon>
                                        {
                                            profileProgress !== 100 && (
                                                <>
                                                    <Text size="sm" fw={500} style={{ color: 'var(--marriplan-muted)' }}>
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
                                    <Progress
                                        value={profileProgress}
                                        size="md"
                                        radius="xl"
                                        mb={8}
                                        styles={{
                                            section: {
                                                background: progressTone,
                                            },
                                        }}
                                    />
                                    <Text size="xs" c="dimmed" mb={6}>
                                        Complete todos os campos obrigatórios para liberar todos os recursos do Marriplan.
                                    </Text>
                                    <Box>
                                        {requiredFields.map(field => (
                                            <Group key={field.key} gap={6} align="center" mb={2}>
                                                {user?.wedding_profile?.[field.key] ? (
                                                    <ThemeIcon
                                                        size={18}
                                                        radius="xl"
                                                        variant="light"
                                                        style={{ backgroundColor: 'rgba(181, 139, 122, 0.18)', color: 'var(--marriplan-rose)' }}
                                                    >
                                                        <IconCheck size={14} />
                                                    </ThemeIcon>
                                                ) : (
                                                    <ThemeIcon
                                                        size={18}
                                                        radius="xl"
                                                        variant="light"
                                                        style={{ backgroundColor: 'rgba(200, 176, 138, 0.18)', color: 'var(--marriplan-gold)' }}
                                                    >
                                                        <IconAlertCircle size={14} />
                                                    </ThemeIcon>
                                                )}
                                                <Text size="sm" style={{ color: 'var(--marriplan-text)' }}>
                                                    {field.label}
                                                </Text>
                                            </Group>
                                        ))}
                                    </Box>
                                </Box>
                            </Menu.Dropdown>
                        </Menu>
                        <Menu shadow="xl" width={220} position="bottom-end" withArrow styles={menuStyles}>
                            <Menu.Target>
                                <Group gap="xs" style={{ cursor: 'pointer' }}>
                                    <Avatar radius="xl" size="md" style={{ border: '1px solid var(--marriplan-border)' }} />
                                    <IconChevronDown size={16} />
                                </Group>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>Conta</Menu.Label>
                                <Menu.Item leftSection={<IconUserCheck size={16} />} onClick={() => router.push('/onboarding')}>
                                    Meus dados
                                </Menu.Item>
                                {/* <Menu.Item leftSection={<IconUser size={16} />} onClick={() => setProfileModalOpen(true)}>
                                    Meu Perfil
                                </Menu.Item> */}
                                {/* <Menu.Item
                                    leftSection={<IconSettings size={16} />}
                                    onClick={() => setSettingsModalOpen(true)}>
                                    Configurações
                                </Menu.Item> */}
                                {/* <Menu.Item leftSection={<IconCreditCard size={16} />}>Pagamento</Menu.Item> */}
                                <Menu.Divider />
                                <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                                    Sair
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar
                withBorder={false}
                p="md"
                style={{
                    overflowY: 'auto',
                    background: 'var(--marriplan-surface)',
                    borderRight: '1px solid var(--marriplan-border)',
                }}
            >
                <Stack gap="xs">
                    <Text size="xs" fw={600} style={{ color: 'var(--marriplan-muted)', letterSpacing: '0.12em' }}>
                        MENU
                    </Text>
                    <NavLink
                        label="Início"
                        leftSection={<IconHome2 size={18} />} // Ícone de dashboard
                        active={router.pathname === '/dashboard'}
                        onClick={() => router.push('/dashboard')}
                        styles={navLinkStyles}
                    />
                    <NavLink
                        label="Checklist de Casamento"
                        leftSection={<IconChecklist size={18} />} // Ícone de checklist
                        active={router.pathname === '/checklist'}
                        onClick={() => router.push('/checklist')}
                        styles={navLinkStyles}
                    />
                    <NavLink
                        label="Meus Convidados"
                        leftSection={<IconUser size={18} />} // Ícone de usuário
                        active={router.pathname === '/guests'}
                        onClick={() => router.push('/guests')}
                        styles={navLinkStyles}
                    />
                    <NavLink
                        label="Lista de Presentes"
                        leftSection={<IconGift size={18} />} // Ícone de presente
                        active={router.pathname === '/gifts'}
                        onClick={() => router.push('/gifts')}
                        styles={navLinkStyles}
                    />

                {/* <NavLink
                    label="Meu Site"
                    leftSection={<IconWorldWww size={18} />} // Ícone de casa
                >
                    <NavLink label="Configuração do Site" onClick={() => router.push('/meu-site')} />
                    <NavLink label="Histórico de Atualizações" onClick={() => router.push('/meu-site/historico')} />
                    <NavLink label="Domínio Personalizado" onClick={() => router.push('/meu-site/dominio')} disabled />
                </NavLink> */}

                    <NavLink
                        label="Notificações"
                        leftSection={<IconBell size={18} />}
                        active={router.pathname === '/notifications'}
                        onClick={() => router.push('/notifications')}
                        styles={navLinkStyles}
                    />
                {/* <NavLink
                    label="Relatórios"
                    leftSection={<IconReportAnalytics size={18} />}
                    active={router.pathname === '/reports'}
                    onClick={() => router.push('/reports')}
                /> */}

                    <NavLink
                        label="Sair"
                        leftSection={<IconLogout size={18} />}
                        onClick={handleLogout}
                        styles={{
                            root: {
                                borderRadius: 12,
                                padding: '10px 12px',
                                color: '#b4534f',
                                transition: 'all 180ms ease',
                                fontWeight: 500,
                                '&:hover': {
                                    backgroundColor: 'rgba(180, 83, 79, 0.08)',
                                },
                            },
                            label: {
                                fontWeight: 500,
                                color: '#b4534f',
                            },
                            section: {
                                color: '#b4534f',
                            },
                        }}
                    />
                </Stack>

            </AppShell.Navbar>

            <AppShell.Main
                className="marriplan-fade-in"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box style={{ width: '100%', maxWidth: 1240, margin: '0 auto' }}>
                    {children}
                </Box>
            </AppShell.Main>

            <ProfileModal opened={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
            {/* <SettingsModal
                opened={settingsModalOpen}
                onClose={() => {
                    setSettingsModalOpen(false);
                }}
            /> */}

            {/*<AppShell.Footer p="md" withBorder style={{height: 50}}>*/}
            {/*    <Text ta="center" size="sm" color="dimmed">*/}
            {/*        Marriplan @ {getCurrentYear()}*/}
            {/*    </Text>*/}
            {/*</AppShell.Footer>*/}
            {/* Conteúdo principal */}

        </AppShell>
    );
}
