import { useAuth, unprotectedRoutes } from "@/contexts/AuthContext";
import { fetchChecklistTasks } from "@/services/checklist";
import { giftsService } from "@/services/giftsService";
import { guests_list_all } from "@/services/guests";
import {
  listWeddingSuppliers,
  WeddingSupplier,
} from "@/services/suppliers";
import {
  getWeddingIdentity,
  listWeddingInspirations,
  WeddingIdentityInspirationRecord,
} from "@/services/weddingIdentity.service";
import { ChecklistTask } from "@/types/checklist";
import {
  Badge,
  Box,
  Button,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconBriefcase,
  IconCheck,
  IconChecklist,
  IconGift,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useMemo, useState } from "react";

const FIRST_STEPS_REFRESH_EVENT = "marriplan:first-steps-refresh";

type FirstStepItem = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  done: boolean;
};

type FirstStepsProgress = {
  identity: boolean;
  checklist: boolean;
  guests: boolean;
  suppliers: boolean;
  gifts: boolean;
};

const dropdownStyles = {
  dropdown: {
    borderRadius: 20,
    border: "1px solid var(--marriplan-border)",
    background:
      "linear-gradient(180deg, rgba(255, 250, 246, 0.99) 0%, rgba(246, 239, 231, 0.99) 100%)",
    boxShadow: "0 24px 40px rgba(70, 56, 43, 0.18)",
    padding: 0,
    overflow: "hidden",
  },
} as const;

const normalizeArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object" && "results" in data) {
    return (data as { results?: unknown[] }).results ?? [];
  }

  return [];
};

const normalizeChecklistTasks = (data: unknown): ChecklistTask[] =>
  normalizeArray(data) as ChecklistTask[];

const normalizeInspirations = (data: unknown): WeddingIdentityInspirationRecord[] =>
  normalizeArray(data) as WeddingIdentityInspirationRecord[];

export function FirstStepsFloatingMenu() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isAuthenticated, loading } = useAuth();
  const [opened, setOpened] = useState(false);
  const [progress, setProgress] = useState<FirstStepsProgress>({
    identity: false,
    checklist: false,
    guests: false,
    suppliers: false,
    gifts: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshSeed, setRefreshSeed] = useState(0);

  const routesForbidden = [
    ...unprotectedRoutes,
    '/onboarding',
  ]
  const isPublicRoute = routesForbidden.includes(router.pathname);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshSeed((previous) => previous + 1);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(FIRST_STEPS_REFRESH_EVENT, handleRefresh);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(FIRST_STEPS_REFRESH_EVENT, handleRefresh);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadProgress = async () => {
      if (isPublicRoute || loading || !isAuthenticated) {
        if (mounted) {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const [identity, checklistTasks, guests, suppliers, gifts] =
          await Promise.all([
            getWeddingIdentity().catch(() => null),
            fetchChecklistTasks().catch(() => []),
            guests_list_all().catch(() => ({ results: [], count: 0 })),
            listWeddingSuppliers({ page: 1, page_size: 1 }).catch(() => ({ results: [], count: 0 })),
            giftsService.listAllGifts().catch(() => ({ results: [], count: 0 })),
          ]);

        const hasIdentity = Boolean(
          identity?.selected_style &&
            identity?.wedding_size &&
            identity?.dress_code &&
            normalizeArray(identity?.palette).length > 0
        );

        const hasChecklistDone = normalizeChecklistTasks(checklistTasks).some(
          (task) => task?.status === "done",
        );

        const hasGuests = normalizeArray(guests).length > 0;

        const supplierResults =
          typeof suppliers === "object" && suppliers !== null && "results" in suppliers
            ? (suppliers as { results?: WeddingSupplier[]; count?: number })
            : { results: [], count: 0 };

        const hasSuppliers =
          (supplierResults.count ?? 0) > 0 || normalizeArray(supplierResults.results).length > 0;

        const giftResults =
          typeof gifts === "object" && gifts !== null && "results" in gifts
            ? (gifts as { results?: unknown[]; count?: number })
            : { results: [], count: 0 };

        const hasGifts =
          (giftResults.count ?? 0) > 0 || normalizeArray(giftResults.results).length > 0;

        if (mounted) {
          setProgress({
            identity: hasIdentity,
            checklist: hasChecklistDone,
            guests: hasGuests,
            suppliers: hasSuppliers,
            gifts: hasGifts,
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProgress();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isPublicRoute, loading, router.pathname, refreshSeed]);

  const items = useMemo<FirstStepItem[]>(
    () => [
      {
        key: "identity",
        title: "Definir identidade do casamento",
        description:
          "Escolha estilo, dress code, paleta, tamanho e inspirações visuais.",
        href: "/identity/overview",
        icon: <IconSparkles size={18} />,
        done: progress.identity,
      },
      {
        key: "checklist",
        title: "Concluir uma tarefa",
        description: "Comece a avançar no planejamento com o checklist.",
        href: "/checklist",
        icon: <IconChecklist size={18} />,
        done: progress.checklist,
      },
      {
        key: "guests",
        title: "Inserir convidados",
        description: "Cadastre pelo menos um convidado na sua lista.",
        href: "/guests",
        icon: <IconUsers size={18} />,
        done: progress.guests,
      },
      {
        key: "suppliers",
        title: "Adicionar fornecedores",
        description: "Inclua ao menos um fornecedor no seu casamento.",
        href: "/meus-fornecedores/fornecedores",
        icon: <IconBriefcase size={18} />,
        done: progress.suppliers,
      },
      {
        key: "gifts",
        title: "Criar presentes",
        description: "Monte sua lista de presentes para compartilhar.",
        href: "/gifts",
        icon: <IconGift size={18} />,
        done: progress.gifts,
      },
    ],
    [progress],
  );

  const doneCount = items.filter((item) => item.done).length;
  const pendingCount = items.length - doneCount;

  useEffect(() => {
    if (doneCount === items.length) {
      setOpened(false);
    }
  }, [doneCount, items.length]);

  if (isPublicRoute || !isAuthenticated || loading || isLoading) {
    return null;
  }

  if (doneCount === items.length) {
    return null;
  }

  const handleNavigate = async (href: string) => {
    setOpened(false);
    await router.push(href);
  };

  return (
    <Box
      style={{
        position: "fixed",
        right: 14,
        bottom: 14,
        width: "fit-content",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <Menu
        opened={opened}
        onChange={setOpened}
        position="top-end"
        offset={14}
        width={380}
        withinPortal
        closeOnItemClick={false}
        withArrow
        shadow="xl"
        styles={dropdownStyles}
      >
        <Menu.Target>
          <Button
            size={isMobile ? "sm" : "md"}
            radius="xl"
            onClick={() => setOpened((current) => !current)}
            leftSection={<IconChecklist size={18} />}
            style={{
              height: isMobile ? 44 : 56,
              paddingInline: isMobile ? 10 : 18,
              border: "1px solid rgba(255, 255, 255, 0.28)",
              background:
                "linear-gradient(135deg, var(--marriplan-champagne) 0%, var(--marriplan-gold) 100%)",
              boxShadow: "0 18px 30px rgba(88, 70, 49, 0.18)",
              color: "var(--marriplan-text)",
              fontWeight: 700,
              minWidth: isMobile ? 54 : undefined,
            }}
          >
            <Group gap={isMobile ? 4 : 8} wrap="nowrap">
                <Text fw={700} size="sm" c="var(--marriplan-text)">
                  Primeiros passos
                </Text>
              <Badge
                size={isMobile ? "xs" : "sm"}
                variant="filled"
                color="gray"
                style={{
                  color: "var(--marriplan-text)",
                  backgroundColor: "rgba(255,255,255,0.5)",
                  minWidth: isMobile ? 24 : undefined,
                  height: isMobile ? 18 : undefined,
                  paddingInline: isMobile ? 6 : undefined,
                }}
              >
                {doneCount}/{items.length}
              </Badge>
            </Group>
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Stack gap={6} px="md" py="sm">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={800} size="sm">
                  Primeiros passos
                </Text>
                <Text size="xs" c="dimmed">
                  {pendingCount} pendente{pendingCount === 1 ? "" : "s"} de {items.length}
                </Text>
              </div>
              <Badge
                variant="light"
                color="gray"
                style={{
                  backgroundColor: "var(--marriplan-surface-muted)",
                  color: "var(--marriplan-text)",
                }}
              >
                {doneCount}/{items.length} concluídos
              </Badge>
            </Group>
          </Stack>
          <ScrollArea h={360} type="auto" offsetScrollbars>
            <Stack gap="xs" px="md" pb="md">
              {items.map((item) => (
                <Box
                  key={item.key}
                  component="button"
                  type="button"
                  onClick={() => void handleNavigate(item.href)}
                  style={{
                    width: "100%",
                    border: "1px solid var(--marriplan-border)",
                    borderRadius: 16,
                    padding: 12,
                    textAlign: "left",
                    cursor: "pointer",
                    background: item.done
                      ? "linear-gradient(180deg, rgba(246, 239, 231, 0.72) 0%, rgba(255, 250, 246, 0.92) 100%)"
                      : "var(--marriplan-surface)",
                    transition: "transform 140ms ease, box-shadow 140ms ease, background 140ms ease",
                    boxShadow: item.done
                      ? "none"
                      : "0 10px 20px rgba(70, 56, 43, 0.06)",
                    opacity: item.done ? 0.72 : 1,
                  }}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="sm" align="flex-start" wrap="nowrap">
                      <ThemeIcon
                        variant="light"
                        radius="xl"
                        size={40}
                        color={item.done ? "gray" : "yellow"}
                        style={{
                          backgroundColor: item.done
                            ? "var(--marriplan-surface-muted)"
                            : "var(--marriplan-champagne)",
                          color: item.done
                            ? "var(--marriplan-muted)"
                            : "var(--marriplan-text)",
                        }}
                      >
                        {item.done ? <IconCheck size={18} /> : item.icon}
                      </ThemeIcon>
                      <Stack gap={4} style={{ flex: 1 }}>
                        <Text
                          fw={700}
                          size="sm"
                          c={item.done ? "dimmed" : undefined}
                          style={{
                            textDecoration: item.done ? "line-through" : "none",
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text size="xs" c="dimmed" style={{ lineHeight: 1.35 }}>
                          {item.description}
                        </Text>
                      </Stack>
                    </Group>
                    {/* <Badge
                      size="sm"
                      color={item.done ? "gray" : "yellow"}
                      variant="light"
                      style={{
                        backgroundColor: item.done
                          ? "var(--marriplan-surface-muted)"
                          : "var(--marriplan-champagne)",
                        color: item.done
                          ? "var(--marriplan-muted)"
                          : "var(--marriplan-text)",
                      }}
                    >
                      {item.done ? "Done" : "Abrir"}
                    </Badge> */}
                  </Group>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}
