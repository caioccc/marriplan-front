import api from "@/services/api";
import { PALETTE } from "@/styles";
import {
  Box,
  Card,
  Center,
  Group,
  Loader,
  Progress,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowUpRight,
  IconAutomation,
  IconCheck,
  IconCircleDot,
  IconSquare
} from "@tabler/icons-react";
import { useRouter } from "next/navigation"; // Ou 'next/router' dependendo da versão do seu Next.js
import { useEffect, useMemo, useState } from "react";

// --- Interface do Novo Endpoint ---
interface SystemTask {
  key: string;
  title: string;
  status: "done" | "pending";
  path: string;
}

export default function SystemTasksWidget() {
  const router = useRouter();
  const [tasks, setTasks] = useState<SystemTask[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Busca os dados da nova API ---
  async function fetchSystemTasks() {
    setLoading(true);
    try {
      const response = await api.get("/api/tasks-system/");
      console.log("Resposta da API de Tarefas do Sistema:", response);
      const data = await response.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao buscar tarefas do sistema:", e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSystemTasks();
  }, []);

  // --- Regra de Negócio: Estatísticas para engajamento ---
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const pending = total - done;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, percent };
  }, [tasks]);

  // --- Ordenação Garantida: Pendentes no topo ---
  const orderedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status == "pending" ? -1 : 1; // 'pending' vem primeiro
    });
  }, [tasks]);

  // --- Redirecionamento com feedback visual ---
  const handleTaskClick = (task: SystemTask) => {
    if (task.status === "done") return;
    router.push(task.path);
  };

  if (loading && tasks.length === 0) {
    return (
      <Card
        radius="xl"
        p="md"
        style={{ border: `1px solid ${PALETTE.line}`, minHeight: 240 }}
      >
        <Center style={{ flex: 1 }}>
          <Loader size="sm" />
        </Center>
      </Card>
    );
  }

  return (
    <Card
      radius="xl"
      p="md"
      style={{
        background: PALETTE.softWhite || "#ffffff",
        border: `1px solid ${PALETTE.line}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cabeçalho de Incentivo com Contadores */}
      <Group justify="space-between" align="flex-start" mb="md">
        <Stack gap={2} w="100%">
          {/* Linha do Título com Ícone e Porcentagem Inline */}
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap={6} style={{ minWidth: 0 }}>
              <IconAutomation
                size={18}
                color={PALETTE.roseGold || "var(--marriplan-rose)"}
                style={{ flexShrink: 0 }}
              />
              <Title
                order={4}
                c={PALETTE.ink}
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Conquistas do Casal
              </Title>
            </Group>

            {/* A porcentagem ganha destaque limpo no canto direito */}
            <Text
              size="sm"
              fw={700}
              c={PALETTE.roseGold || "var(--marriplan-rose)"}
            >
              {stats.percent}%
            </Text>
          </Group>

          {/* Subtítulo descritivo com contexto de organização de casamento */}
          <Text size="xs" c={PALETTE.warmGray} mt={2}>
            {stats.done} de {stats.total} etapas concluídas na sua organização
          </Text>

          {/* Barra de progresso micro (fina, discreta e moderna) */}
          <Progress
            value={stats.percent}
            color={PALETTE.roseGold || "var(--marriplan-rose)"}
            mt="xs"
            size="4px"
            radius="xl"
          />
        </Stack>

        {/* Badge Flutuante de Restantes */}
        <Box
          style={{
            backgroundColor:
              stats.pending > 0
                ? "rgba(247, 241, 232, 0.6)"
                : "rgba(43, 138, 62, 0.1)",
            padding: "4px 10px",
            borderRadius: "12px",
            border: `1px solid ${
              stats.pending > 0 ? PALETTE.line : "transparent"
            }`,
          }}
        >
          <Text
            size="11px"
            fw={700}
            color={stats.pending > 0 ? PALETTE.ink : "green"}
          >
            {stats.pending > 0
              ? `${stats.pending} restantes`
              : "100% Completo! 🎉"}
          </Text>
        </Box>
      </Group>

      {/* Lista de Ações com Scroll fixo para parear com os outros cards */}
      <ScrollArea h={320} offsetScrollbars scrollbarSize={4} pr="xs">
        <Box style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {orderedTasks.map((task) => {
            const isDone = task.status === "done";

            return (
              <UnstyledButton
                key={task.key}
                onClick={() => handleTaskClick(task)}
                disabled={isDone}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  transition: "all 150ms ease",
                  cursor: isDone ? "default" : "pointer",
                  border: isDone
                    ? "1px solid transparent"
                    : `1px solid ${PALETTE.line}50`,
                  backgroundColor: isDone ? "transparent" : "#ffffff",
                  boxShadow: isDone ? "none" : "0 1px 2px rgba(0,0,0,0.02)",
                  opacity: isDone ? 0.45 : 1,
                  // Efeitos de Hover para engajar o clique apenas se não estiver feito
                  "&:hover": !isDone
                    ? {
                        backgroundColor: "rgba(247, 241, 232, 0.4)",
                        borderColor:
                          PALETTE.roseGold || "var(--marriplan-rose)",
                        transform: "translateX(2px)",
                      }
                    : {},
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group
                    gap="xs"
                    wrap="nowrap"
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    {/* Indicador de Ação Automatizada */}
                    {isDone ? (
                      <ThemeIcon
                        size={16}
                        radius="xl"
                        color={PALETTE.roseGold || "var(--marriplan-rose)"}
                      >
                        <IconCheck size={10} stroke={3} />
                      </ThemeIcon>
                    ) : (
                      <ThemeIcon
                        size={16}
                        radius="xl"
                        variant="light"
                        color={PALETTE.marriplanRose || "var(--marriplan-beige)"}
                      >
                        <IconSquare size={18} stroke={2.5} />
                      </ThemeIcon>
                    )}

                    {/* Título com Risco se estiver Concluído */}
                    <Text
                      size="xs"
                      fw={isDone ? 400 : 600}
                      c={PALETTE.ink}
                      style={{
                        textDecoration: isDone ? "line-through" : "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {task.title}
                    </Text>
                  </Group>

                  {/* Seta indicativa de link para as pendentes */}
                  {!isDone && (
                    <IconArrowUpRight
                      size={14}
                      color={PALETTE.roseGold || "var(--marriplan-rose)"}
                      style={{ flexShrink: 0, opacity: 0.8 }}
                    />
                  )}
                </Group>
              </UnstyledButton>
            );
          })}
        </Box>
      </ScrollArea>
    </Card>
  );
}
