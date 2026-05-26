import { NotificationsBell } from "@/components/NotificationsBell";
import WeddingProfileDataModal from "@/components/WeddingProfileDataModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Group,
  Indicator,
  Menu,
  NavLink,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconBell,
  IconBriefcase,
  IconCheck,
  IconChecklist,
  IconChevronDown,
  IconGift,
  IconHome2,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconSparkles,
  IconUser,
  IconUserCheck,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

const SYSTEM_VERSION = "v0.1.0";

export default function BaseLayout({ children }: Readonly<BaseLayoutProps>) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [opened, setOpened] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setOpened(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setOpened((current) => !current);
  };

  const handleSidebarNavigation = (path: string) => {
    if (isMobile) {
      setOpened(false);
    }

    if (router.pathname !== path) {
      router.push(path);
    }
  };

  const handleLogout = async () => {
    logout();
    router.push("/login");
  };

  // Cálculo do progresso do perfil de casamento
  let profileProgress = 0;
  const requiredFields = [
    { key: "nome_noivo", label: "Nome do noivo" },
    { key: "nome_noiva", label: "Nome da noiva" },
    { key: "data_casamento", label: "Data do casamento" },
    { key: "hora_casamento", label: "Hora do casamento" },
  ];
  let filled = 0;
  const completedFields: string[] = [];
  const missingFields: string[] = [];
  const coupleName = user?.wedding_profile
    ? `${user.wedding_profile.nome_noivo || "Noivo"} & ${
        user.wedding_profile.nome_noiva || "Noiva"
      }`
    : "Noivos";
  if (user?.wedding_profile) {
    const p = user.wedding_profile;
    requiredFields.forEach((field) => {
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

  const progressTone =
    profileProgress === 100 ? "var(--marriplan-rose)" : "var(--marriplan-gold)";
  const sidebarWidth = opened ? 248 : 72;
  const collapsedSidebar = !opened;
  const isWeddingIdentityRoute = router.pathname.startsWith(
    "/identidade-do-casamento",
  );
  const [identityMenuOpen, setIdentityMenuOpen] = useState(
    isWeddingIdentityRoute,
  );

  useEffect(() => {
    setIdentityMenuOpen(isWeddingIdentityRoute);
  }, [isWeddingIdentityRoute]);

  const navLinkStyles = {
    root: {
      borderRadius: 12,
      padding: opened ? "10px 12px" : "10px 8px",
      color: "var(--marriplan-text)",
      transition: "all 180ms ease",
      fontWeight: 500,
      justifyContent: opened ? "flex-start" : "center",
      "&:hover": {
        backgroundColor: "rgba(242, 230, 216, 0.6)",
      },
      "&[data-active]": {
        background: "linear-gradient(90deg, #f6eee4 0%, #fbf7f2 100%)",
        boxShadow: "inset 0 0 0 1px var(--marriplan-border)",
      },
    },
    label: {
      fontWeight: 500,
      letterSpacing: "0.01em",
      display: opened ? "block" : "none",
    },
    section: {
      color: "var(--marriplan-muted)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginInlineEnd: opened ? 8 : 0,
      width: collapsedSidebar ? "100%" : "auto",
    },
  } as const;
  const menuStyles = {
    dropdown: {
      borderRadius: 16,
      border: "1px solid var(--marriplan-border)",
      background: "var(--marriplan-surface)",
      boxShadow: "var(--marriplan-shadow)",
    },
    item: {
      borderRadius: 10,
      transition: "all 140ms ease",
      "&[data-hovered]": {
        backgroundColor: "rgba(242, 230, 216, 0.6)",
      },
    },
    label: {
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--marriplan-muted)",
    },
  } as const;

  return (
    <AppShell
      layout="alt"
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: sidebarWidth,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      styles={{
        main: {
          background: "var(--marriplan-bg)",
          minHeight: "100dvh",
        },
      }}
    >
      <AppShell.Header
        p="md"
        style={{
          display: "flex",
          alignItems: "center",
          background: "rgba(255, 251, 247, 0.9)",
          borderBottom: "1px solid var(--marriplan-border)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Group justify="space-between" align="center" w="100%" h="100%">
          <Group gap="sm" wrap="nowrap" align="center" h="100%">
            <Box
              component="button"
              type="button"
              onClick={toggleSidebar}
              aria-label={opened ? "Fechar Menu" : "Abrir Menu"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "100%",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <Tooltip
                label={opened ? "Fechar Menu" : "Abrir Menu"}
                withArrow
                position="bottom"
              >
                <ThemeIcon
                  variant="light"
                  size="md"
                  style={{
                    backgroundColor: "var(--marriplan-champagne)",
                    color: "var(--marriplan-rose)",
                  }}
                >
                  {opened ? (
                    <IconLayoutSidebarLeftCollapse size={18} />
                  ) : (
                    <IconLayoutSidebarLeftExpand size={18} />
                  )}
                </ThemeIcon>
              </Tooltip>
              <Text fw={700} size="xl" style={{ letterSpacing: "0.02em" }}>
                Marriplan
              </Text>
            </Box>
          </Group>

          {/* Ícones e menu à direita */}
          <Group align="center" h="100%">
            <NotificationsBell />
            {!isMobile && (
              <Menu
                shadow="xl"
                width={300}
                position="bottom-end"
                withArrow
                styles={menuStyles}
              >
                <Menu.Target>
                  <Indicator
                    color={progressTone}
                    size={10}
                    offset={4}
                    processing={profileProgress < 100}
                  >
                    <Group gap={4} style={{ cursor: "pointer" }}>
                      <ThemeIcon
                        variant="light"
                        size="lg"
                        style={{
                          backgroundColor: "var(--marriplan-champagne)",
                          color: "var(--marriplan-rose)",
                        }}
                      >
                        <IconUserCheck size={20} />
                      </ThemeIcon>
                      {profileProgress !== 100 && (
                        <>
                          <Text
                            size="sm"
                            fw={500}
                            style={{ color: "var(--marriplan-muted)" }}
                          >
                            Perfil {profileProgress}%
                          </Text>
                          <IconChevronDown size={16} />
                        </>
                      )}
                    </Group>
                  </Indicator>
                </Menu.Target>
                <Menu.Dropdown>
                  <Box p="xs">
                    <Text size="sm" fw={600} mb={4}>
                      Progresso do perfil de casamento
                    </Text>
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
                      Complete todos os campos obrigatórios para liberar todos
                      os recursos do Marriplan.
                    </Text>
                    <Box>
                      {requiredFields.map((field) => (
                        <Group key={field.key} gap={6} align="center" mb={2}>
                          {user?.wedding_profile?.[field.key] ? (
                            <ThemeIcon
                              size={18}
                              radius="xl"
                              variant="light"
                              style={{
                                backgroundColor: "rgba(181, 139, 122, 0.18)",
                                color: "var(--marriplan-rose)",
                              }}
                            >
                              <IconCheck size={14} />
                            </ThemeIcon>
                          ) : (
                            <ThemeIcon
                              size={18}
                              radius="xl"
                              variant="light"
                              style={{
                                backgroundColor: "rgba(200, 176, 138, 0.18)",
                                color: "var(--marriplan-gold)",
                              }}
                            >
                              <IconAlertCircle size={14} />
                            </ThemeIcon>
                          )}
                          <Text
                            size="sm"
                            style={{ color: "var(--marriplan-text)" }}
                          >
                            {field.label}
                          </Text>
                        </Group>
                      ))}
                    </Box>
                  </Box>
                </Menu.Dropdown>
              </Menu>
            )}
            <Menu
              shadow="xl"
              width={220}
              position="bottom-end"
              withArrow
              styles={menuStyles}
            >
              <Menu.Target>
                <Group gap="xs" style={{ cursor: "pointer" }}>
                  <Avatar
                    radius="xl"
                    size="md"
                    style={{ border: "1px solid var(--marriplan-border)" }}
                  />
                  <IconChevronDown size={16} />
                </Group>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Conta</Menu.Label>
                <Menu.Item
                  leftSection={<IconUserCheck size={16} />}
                  onClick={() => setProfileModalOpen(true)}
                >
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
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={16} />}
                  onClick={handleLogout}
                >
                  Sair
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        withBorder={false}
        p={opened ? "md" : "xs"}
        style={{
          overflowY: "auto",
          background: "var(--marriplan-surface)",
          borderRight: "1px solid var(--marriplan-border)",
          alignItems: opened ? "stretch" : "center",
        }}
      >
        {isMobile && opened && (
          <Group justify="space-between" mb="sm">
            <Text fw={700} size="xl" style={{ letterSpacing: "0.02em" }}>
              Marriplan
            </Text>
            <Tooltip label="Fechar sidebar" withArrow position="left">
              <ActionIcon
                variant="light"
                size="lg"
                aria-label="Fechar sidebar"
                onClick={toggleSidebar}
                style={{
                  backgroundColor: "var(--marriplan-champagne)",
                  color: "var(--marriplan-rose)",
                }}
              >
                <IconLayoutSidebarLeftCollapse size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
        <Stack gap="xs" style={{ width: "100%", minHeight: "100%" }}>
          {!opened && (
            <Box
              component="img"
              src="/logo-marri.png"
              alt="Logo Marriplan"
              width={28}
              height={28}
              style={{
                borderRadius: 10,
                boxShadow: "0 8px 18px rgba(70, 56, 43, 0.14)",
                alignSelf: "center",
              }}
            />
          )}
          {opened && (
            <Text
              size="xs"
              fw={600}
              style={{
                color: "var(--marriplan-muted)",
                letterSpacing: "0.12em",
              }}
            >
              MENU
            </Text>
          )}
          <NavLink
            label={opened ? "Início" : ""}
            leftSection={<IconHome2 size={18} />} // Ícone de dashboard
            active={router.pathname === "/dashboard"}
            onClick={() => handleSidebarNavigation("/dashboard")}
            aria-label="Início"
            styles={navLinkStyles}
          />
          <NavLink
            label={opened ? "Identidade do Casamento" : ""}
            leftSection={<IconSparkles size={18} />}
            active={router.pathname.startsWith("/identity")}
            opened={identityMenuOpen}
            onClick={() => handleSidebarNavigation("/identity/overview")}
            aria-label="Identidade do Casamento"
            styles={navLinkStyles}
          />
          <NavLink
            label={opened ? "Checklist de Casamento" : ""}
            leftSection={<IconChecklist size={18} />} // Ícone de checklist
            active={router.pathname === "/checklist"}
            onClick={() => handleSidebarNavigation("/checklist")}
            aria-label="Checklist de Casamento"
            styles={navLinkStyles}
          />
          <NavLink
            label={opened ? "Meus Convidados" : ""}
            leftSection={<IconUser size={18} />} // Ícone de usuário
            active={router.pathname === "/guests"}
            onClick={() => handleSidebarNavigation("/guests")}
            aria-label="Meus Convidados"
            styles={navLinkStyles}
          />
          <NavLink
            label={opened ? "Meus Fornecedores" : ""}
            leftSection={<IconBriefcase size={18} />}
            active={router.pathname === "/meus-fornecedores"}
            onClick={() => handleSidebarNavigation("/meus-fornecedores")}
            aria-label="Meus Fornecedores"
            styles={navLinkStyles}
          />
          <NavLink
            label={opened ? "Lista de Presentes" : ""}
            leftSection={<IconGift size={18} />} // Ícone de presente
            active={router.pathname === "/gifts"}
            onClick={() => handleSidebarNavigation("/gifts")}
            aria-label="Lista de Presentes"
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
            label={opened ? "Notificações" : ""}
            leftSection={<IconBell size={18} />}
            active={router.pathname === "/notifications"}
            onClick={() => handleSidebarNavigation("/notifications")}
            aria-label="Notificações"
            styles={navLinkStyles}
          />
          {/* <NavLink
                    label="Relatórios"
                    leftSection={<IconReportAnalytics size={18} />}
                    active={router.pathname === '/reports'}
                    onClick={() => router.push('/reports')}
                /> */}

          <NavLink
            label={opened ? "Sair" : ""}
            leftSection={<IconLogout size={18} stroke={2.2} />}
            onClick={handleLogout}
            aria-label="Sair"
            styles={{
              root: {
                borderRadius: 12,
                padding: opened ? "10px 12px" : "10px 8px",
                color: "#b4534f",
                transition: "all 180ms ease",
                fontWeight: 500,
                display: "flex",
                justifyContent: opened ? "flex-start" : "center",
                "&:hover": {
                  backgroundColor: "rgba(180, 83, 79, 0.08)",
                },
              },
              label: {
                fontWeight: 500,
                color: "#b4534f",
                display: opened ? "block" : "none",
              },
              section: {
                color: "#b4534f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginInlineEnd: opened ? 8 : 0,
                width: !opened ? "100%" : "auto",
              },
            }}
          />

          <Box
            style={{
              marginTop: "auto",
              paddingTop: opened ? 12 : 8,
              borderTop: "1px solid var(--marriplan-border)",
              width: "100%",
            }}
          >
            <Stack gap={2} align={opened ? "flex-start" : "center"}>
              <Text
                size="xs"
                fw={600}
                style={{
                  color: "var(--marriplan-muted)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  display: opened ? "block" : "none",
                }}
              >
                {coupleName}
              </Text>
              <Text
                size="xs"
                fw={600}
                style={{
                  color: "var(--marriplan-text)",
                  display: opened ? "block" : "none",
                }}
              >
                Sistema {SYSTEM_VERSION}
              </Text>
              {!opened && (
                <Text
                  size="xs"
                  fw={600}
                  ta="center"
                  style={{
                    color: "var(--marriplan-muted)",
                    lineHeight: 1.3,
                  }}
                >
                  {SYSTEM_VERSION}
                </Text>
              )}
            </Stack>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main
        className="marriplan-fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box style={{ width: "100%", maxWidth: 1240, margin: "0 auto" }}>
          {children}
        </Box>
      </AppShell.Main>

      <WeddingProfileDataModal
        opened={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onComplete={() => setProfileModalOpen(false)}
      />
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
