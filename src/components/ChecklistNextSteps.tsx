import { PALETTE } from "@/styles";
import { ChecklistTask } from "@/types/checklist";
import { Box, Center, Checkbox, Collapse, Group, Loader, Paper, Text } from "@mantine/core";
import { useMemo, useState } from "react";
import { MarriplanStatusBadge } from "./MarriplanStatusBadge";

interface ChecklistWidgetProps {
  checklistTasks: ChecklistTask[];
  loadingChecklist: boolean;
  loadingTaskId: number | null;
  handleToggleDone: (task: ChecklistTask) => Promise<void>;
}

export default function ChecklistWidget({
  checklistTasks,
  loadingChecklist,
  loadingTaskId,
  handleToggleDone,
}: ChecklistWidgetProps) {
  // O filtro dos 4 primeiros pendentes continua isolado aqui dentro
  const nextTasks = useMemo(() => {
    const priorityWeight: Record<string, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return checklistTasks
      .filter((task) => task.status !== "done")
      .sort((a, b) => {
        const dateA = a.due_date || a.start_date || a.created_at;
        const dateB = b.due_date || b.start_date || b.created_at;
        const timeA = dateA
          ? new Date(dateA).getTime()
          : Number.MAX_SAFE_INTEGER;
        const timeB = dateB
          ? new Date(dateB).getTime()
          : Number.MAX_SAFE_INTEGER;

        if (timeA !== timeB) return timeA - timeB;
        return (
          (priorityWeight[a.priority] ?? 3) - (priorityWeight[b.priority] ?? 3)
        );
      })
      .slice(0, 5);
  }, [checklistTasks]);

  if (loadingChecklist && checklistTasks.length === 0) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  if (nextTasks.length === 0) {
    return (
      <Text size="sm" c={PALETTE.warmGray}>
        Nenhuma tarefa pendente no momento.
      </Text>
    );
  }

  return (
    <Box>
      {nextTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isLoading={loadingTaskId === task.id}
          handleToggleDone={handleToggleDone}
        />
      ))}
    </Box>
  );
}

// --- SUBCOMPONENTE DE ANIMAÇÃO LOCAL ---
function TaskCard({
  task,
  isLoading,
  handleToggleDone,
}: {
  task: ChecklistTask;
  isLoading: boolean;
  handleToggleDone: (task: ChecklistTask) => Promise<void>;
}) {
  const isDone = task.status === "done";
  const [showItem, setShowItem] = useState(true);

  const handleCardClick = async () => {
    if (isLoading) return;

    if (!isDone) {
      setShowItem(false); // Some da tela suavemente por 200ms
      setTimeout(async () => {
        await handleToggleDone(task); // Dispara a mudança que atualiza a Dashboard inteira
      }, 200);
    } else {
      await handleToggleDone(task);
    }
  };

  return (
    <Collapse in={showItem} animateOpacity transitionDuration={200}>
      <Paper
        radius="lg"
        p="sm"
        className="marriplan-card"
        mb="xs"
        onClick={handleCardClick}
        style={{
          border: `1px solid ${PALETTE.line}`,
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "all 200ms ease",
          opacity: isLoading ? 0.6 : 1,
          backgroundColor: isDone ? "rgba(247, 241, 232, 0.1)" : "transparent",
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group align="center" gap="md" style={{ flex: 1, minWidth: 0 }}>
            <Checkbox
              checked={isDone}
              readOnly
              disabled={isLoading}
              style={{ pointerEvents: "none" }}
            />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="sm"
                fw={600}
                c={PALETTE.ink}
                style={{ textDecoration: isDone ? "line-through" : "none" }}
              >
                {task.description}
              </Text>
              <Text size="xs" c={PALETTE.warmGray}>
                {task.due_date
                  ? `Entrega: ${new Date(task.due_date).toLocaleDateString(
                      "pt-BR",
                    )}`
                  : "Sem data definida"}
              </Text>
            </Box>
          </Group>
          <Box style={{ flexShrink: 0 }}>
            <MarriplanStatusBadge
              kind="checklist"
              status={String(task.status).toLowerCase()}
            />
          </Box>
        </Group>
      </Paper>
    </Collapse>
  );
}
