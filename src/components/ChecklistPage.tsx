//eslint-disable react-hooks/exhaustive-deps
//eslint-disable @typescript-eslint/no-unused-vars
//eslint-disable @typescript-eslint/no-explicit-any
//eslint no-explicit-any: "off"
import { MarriplanStatusBadge } from "@/components/MarriplanStatusBadge";
import {
  createChecklistTask,
  deleteChecklistTask,
  fetchChecklistTasks,
  updateChecklistTask,
} from "@/services/checklist";
import {
  actionIconDangerStyles,
  actionIconEditStyles,
  actionIconStyles,
  checklistTabsStyles,
  inputStyles,
  primaryButtonStyles,
  softButtonStyles,
} from "@/styles";
import { ChecklistTask } from "@/types/checklist";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Group,
  Loader,
  Modal,
  RingProgress,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip as TooltipMantine,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconChevronRight,
  IconEdit,
  IconFileDownload,
  IconFilter,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ChecklistTaskModal from "./ChecklistTaskModal";
import BaseLayout from "./Layout/_BaseLayout";
import PageSectionHeader from "./PageSectionHeader";

export default function ChecklistPage() {
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ChecklistTask | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [draftFilterStatus, setDraftFilterStatus] = useState<string | null>(
    null,
  );
  const [draftFilterPriority, setDraftFilterPriority] = useState<string | null>(
    null,
  );
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 600px)");
  const isCompactFilters = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    setLoading(true);
    fetchChecklistTasks()
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (advancedFiltersOpen) {
      setDraftFilterStatus(filterStatus);
      setDraftFilterPriority(filterPriority);
    }
  }, [advancedFiltersOpen, filterStatus, filterPriority]);

  // Filtros
  const filteredTasks = tasks.filter(
    (t) =>
      (!search || t.description.toLowerCase().includes(search.toLowerCase())) &&
      (!filterStatus || t.status === filterStatus) &&
      (!filterPriority || t.priority === filterPriority),
  );
  // Agrupamento por fases para Tabs (cada tab é um grupo de períodos)
  const PHASES = [
    {
      key: "fase1",
      label: "12-10 meses antes",
      periods: [
        { label: "12 meses antes", test: (t: ChecklistTask) => t.month === 12 },
        { label: "11 meses antes", test: (t: ChecklistTask) => t.month === 11 },
        { label: "10 meses antes", test: (t: ChecklistTask) => t.month === 10 },
      ],
    },
    {
      key: "fase2",
      label: "9-5 meses antes",
      periods: [
        { label: "9 meses antes", test: (t: ChecklistTask) => t.month === 9 },
        { label: "8 meses antes", test: (t: ChecklistTask) => t.month === 8 },
        { label: "7 meses antes", test: (t: ChecklistTask) => t.month === 7 },
        { label: "6 meses antes", test: (t: ChecklistTask) => t.month === 6 },
        { label: "5 meses antes", test: (t: ChecklistTask) => t.month === 5 },
      ],
    },
    {
      key: "fase3",
      label: "4-1 mês antes",
      periods: [
        { label: "4 meses antes", test: (t: ChecklistTask) => t.month === 4 },
        { label: "3 meses antes", test: (t: ChecklistTask) => t.month === 3 },
        { label: "2 meses antes", test: (t: ChecklistTask) => t.month === 2 },
        { label: "1 mês antes", test: (t: ChecklistTask) => t.month === 1 },
      ],
    },
    {
      key: "fase4",
      label: "Dias finais e pós",
      periods: [
        {
          label: "15 dias antes",
          test: (t: ChecklistTask) => t.days_before_event === 15,
        },
        {
          label: "10 dias antes",
          test: (t: ChecklistTask) => t.days_before_event === 10,
        },
        {
          label: "1 semana antes",
          test: (t: ChecklistTask) => t.days_before_event === 7,
        },
        {
          label: "5 dias antes",
          test: (t: ChecklistTask) => t.days_before_event === 5,
        },
        {
          label: "2 dias antes",
          test: (t: ChecklistTask) => t.days_before_event === 2,
        },
        {
          label: "1 dia antes",
          test: (t: ChecklistTask) => t.days_before_event === 1,
        },
        {
          label: "Após o casamento",
          test: (t: ChecklistTask) => t.days_before_event === -1,
        },
      ],
    },
  ];

  // Mapeamento dos períodos para exibição
  const PERIODS = [
    { label: "12 meses antes", test: (t: ChecklistTask) => t.month === 12 },
    { label: "11 meses antes", test: (t: ChecklistTask) => t.month === 11 },
    { label: "10 meses antes", test: (t: ChecklistTask) => t.month === 10 },
    { label: "9 meses antes", test: (t: ChecklistTask) => t.month === 9 },
    { label: "8 meses antes", test: (t: ChecklistTask) => t.month === 8 },
    { label: "7 meses antes", test: (t: ChecklistTask) => t.month === 7 },
    { label: "6 meses antes", test: (t: ChecklistTask) => t.month === 6 },
    { label: "5 meses antes", test: (t: ChecklistTask) => t.month === 5 },
    { label: "4 meses antes", test: (t: ChecklistTask) => t.month === 4 },
    { label: "3 meses antes", test: (t: ChecklistTask) => t.month === 3 },
    { label: "2 meses antes", test: (t: ChecklistTask) => t.month === 2 },
    { label: "1 mês antes", test: (t: ChecklistTask) => t.month === 1 },
    {
      label: "15 dias antes",
      test: (t: ChecklistTask) => t.days_before_event === 15,
    },
    {
      label: "10 dias antes",
      test: (t: ChecklistTask) => t.days_before_event === 10,
    },
    {
      label: "1 semana antes",
      test: (t: ChecklistTask) => t.days_before_event === 7,
    },
    {
      label: "5 dias antes",
      test: (t: ChecklistTask) => t.days_before_event === 5,
    },
    {
      label: "2 dias antes",
      test: (t: ChecklistTask) => t.days_before_event === 2,
    },
    {
      label: "1 dia antes",
      test: (t: ChecklistTask) => t.days_before_event === 1,
    },
    {
      label: "Após o casamento",
      test: (t: ChecklistTask) => t.days_before_event === -1,
    },
  ];

  // Função para obter os períodos de cada fase
  function getPeriodsForPhase(phase: (typeof PHASES)[number]) {
    return phase.periods;
  }

  // Calcula progresso por mês
  function getMonthProgress(monthTasks: ChecklistTask[]) {
    if (!monthTasks.length) return 0;
    const done = monthTasks.filter((t) => t.status === "done").length;
    return Math.round((done / monthTasks.length) * 100);
  }

  // Cor do progresso gamificado
  function getProgressColor(progress: number) {
    if (progress === 100) return "var(--marriplan-rose)";
    if (progress >= 70) return "var(--marriplan-gold)";
    if (progress >= 30) return "#d5a55a";
    return "#c06a5a";
  }

  // Handlers
  function handleAddTask(month: number) {
    const newTask: ChecklistTask = {
      id: 0,
      month,
      days_before_event: null,
      description: "",
      start_date: "",
      due_date: "",
      priority: "medium",
      status: "pending",
      is_template: false,
      attachments: [],
      created_at: "",
      updated_at: "",
    };

    setEditingTask(newTask);
    setModalOpen(true);
  }
  function handleEditTask(task: ChecklistTask) {
    setEditingTask(task);
    setModalOpen(true);
  }
  // eslint-disable-next-line
  async function handleSaveTask(task: Partial<ChecklistTask>, file?: File) {
    setModalOpen(false);
    if (editingTask && editingTask.id) {
      await updateChecklistTask(editingTask.id, task);
    } else {
      await createChecklistTask({ ...task, month: editingTask?.month });
    }
    setLoading(true);
    fetchChecklistTasks()
      .then(setTasks)
      .finally(() => setLoading(false));
  }
  async function handleDeleteTask(id: number) {
    setLoadingTaskId(id);
    await deleteChecklistTask(id);
    fetchChecklistTasks()
      .then(setTasks)
      .finally(() => setLoadingTaskId(null));
  }
  async function handleToggleDone(task: ChecklistTask) {
    setLoadingTaskId(task.id);
    await updateChecklistTask(task.id, {
      status: task.status === "done" ? "pending" : "done",
    });
    fetchChecklistTasks()
      .then(setTasks)
      .finally(() => setLoadingTaskId(null));
  }

  // Estado global de abertura dos cards: { [phaseKey]: boolean[] }
  const [openedCards, setOpenedCards] = useState<{
    [phaseKey: string]: boolean[];
  }>(() => {
    const obj: { [phaseKey: string]: boolean[] } = {};
    PHASES.forEach((phase) => {
      const periods = getPeriodsForPhase(phase);
      obj[phase.key] = periods.map(() => !isMobile);
    });
    return obj;
  });

  const handleToggle = (phaseKey: string, idx: number) => {
    setOpenedCards((prev) => ({
      ...prev,
      [phaseKey]: prev[phaseKey].map((v, i) => (i === idx ? !v : v)),
    }));
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("pt-BR");
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    in_progress: "Em andamento",
    done: "Concluido",
  };

  const priorityLabels: Record<string, string> = {
    high: "Alta",
    medium: "Media",
    low: "Baixa",
  };

  const handleExportPDF = async () => {
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const autoTable = autoTableModule.default;
    const doc = new jsPDF("p", "mm", "a4");
    const periods = PERIODS;

    periods.forEach((period, index) => {
      if (index > 0) doc.addPage();
      doc.setFontSize(14);
      doc.text(period.label, 14, 18);

      const periodTasks = tasks.filter(period.test);
      if (!periodTasks.length) {
        doc.setFontSize(11);
        doc.text("Sem tarefas para este periodo.", 14, 28);
        return;
      }

      const body = periodTasks.map((task) => [
        task.description,
        formatDate(task.start_date),
        formatDate(task.due_date),
        priorityLabels[task.priority] ?? task.priority,
        statusLabels[task.status] ?? task.status,
      ]);

      autoTable(doc, {
        startY: 26,
        head: [["Descricao", "Inicio", "Vencimento", "Prioridade", "Status"]],
        body,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [246, 238, 228], textColor: "#000" },
        theme: "grid",
      });
    });

    doc.save("checklist_casamento.pdf");
  };

  return (
    <BaseLayout>
      <Box maw={1180} mx="auto" px={{ base: "xs", sm: "md" }}>
        <Stack gap="lg" py="md">
          <PageSectionHeader
            eyebrow="Gestão do casamento"
            title="Checklist de Casamento"
            description="Acompanhe tarefas, prazos e prioridades em uma visão padronizada da aplicação."
            actions={
              isCompactFilters ? undefined : (
                <Button
                  leftSection={<IconFileDownload size={18} />}
                  variant="light"
                  styles={softButtonStyles}
                  onClick={handleExportPDF}
                >
                  Exportar PDF
                </Button>
              )
            }
            filters={
              <Group gap="sm" align="center" wrap="wrap">
                <TextInput
                  leftSection={<IconSearch size={16} />}
                  placeholder="Buscar tarefa..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  w={{ base: "100%", sm: isCompactFilters ? "100%" : 220 }}
                  style={{
                    flex: isCompactFilters ? 1 : undefined,
                    minWidth: isCompactFilters ? 220 : undefined,
                  }}
                  styles={inputStyles}
                />
                {isCompactFilters ? (
                  <TooltipMantine label="Filtros avançados" withArrow>
                    <ActionIcon
                      variant="light"
                      size="lg"
                      aria-label="Abrir filtros avançados"
                      onClick={() => setAdvancedFiltersOpen(true)}
                      styles={actionIconStyles}
                      style={{ alignSelf: "center" }}
                    >
                      <IconFilter size={18} />
                    </ActionIcon>
                  </TooltipMantine>
                ) : (
                  <>
                    <Select
                      data={[
                        { value: "pending", label: "Pendente" },
                        { value: "in_progress", label: "Em Andamento" },
                        { value: "done", label: "Concluído" },
                      ]}
                      value={filterStatus}
                      onChange={(v) => setFilterStatus(v || null)}
                      placeholder="Status"
                      clearable
                      w={{ base: "100%", sm: 170 }}
                      styles={inputStyles}
                    />
                    <Select
                      data={[
                        { value: "high", label: "Alta" },
                        { value: "medium", label: "Média" },
                        { value: "low", label: "Baixa" },
                      ]}
                      value={filterPriority}
                      onChange={(v) => setFilterPriority(v || null)}
                      placeholder="Prioridade"
                      clearable
                      w={{ base: "100%", sm: 170 }}
                      styles={inputStyles}
                    />
                  </>
                )}
              </Group>
            }
          />
          <Modal
            opened={advancedFiltersOpen}
            onClose={() => setAdvancedFiltersOpen(false)}
            title="Filtros avançados"
            centered
            size="sm"
          >
            <Stack gap="md">
              <Select
                data={[
                  { value: "pending", label: "Pendente" },
                  { value: "in_progress", label: "Em Andamento" },
                  { value: "done", label: "Concluído" },
                ]}
                value={draftFilterStatus}
                onChange={(v) => setDraftFilterStatus(v || null)}
                placeholder="Status"
                clearable
                styles={inputStyles}
              />
              <Select
                data={[
                  { value: "high", label: "Alta" },
                  { value: "medium", label: "Média" },
                  { value: "low", label: "Baixa" },
                ]}
                value={draftFilterPriority}
                onChange={(v) => setDraftFilterPriority(v || null)}
                placeholder="Prioridade"
                clearable
                styles={inputStyles}
              />
              <Group justify="space-between" gap="sm" mt="xs">
                <Button
                  variant="light"
                  styles={softButtonStyles}
                  onClick={() => {
                    setDraftFilterStatus(null);
                    setDraftFilterPriority(null);
                  }}
                >
                  Limpar filtros
                </Button>
                <Button
                  styles={primaryButtonStyles}
                  onClick={() => {
                    setFilterStatus(draftFilterStatus);
                    setFilterPriority(draftFilterPriority);
                    setAdvancedFiltersOpen(false);
                  }}
                >
                  Aplicar filtros
                </Button>
              </Group>
            </Stack>
          </Modal>
          {loading ? (
            <Loader />
          ) : (
            <Tabs
              defaultValue={PHASES[0].key}
              variant="pills"
              keepMounted={false}
              styles={checklistTabsStyles}
              className="checklist-tabs"
            >
              <Tabs.List mb="lg">
                {PHASES.map((phase) => (
                  <Tabs.Tab key={phase.key} value={phase.key}>
                    {phase.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {PHASES.map((phase) => {
                const periods = getPeriodsForPhase(phase);
                return (
                  <Tabs.Panel key={phase.key} value={phase.key}>
                    <SimpleGrid
                      cols={{ base: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
                      spacing="lg"
                      verticalSpacing="lg"
                    >
                      {periods.map((period, idx) => {
                        const periodTasks = filteredTasks
                          .filter(period.test)
                          .slice()
                          .sort((a, b) => {
                            const dateA =
                              a.due_date || a.start_date || a.created_at;
                            const dateB =
                              b.due_date || b.start_date || b.created_at;
                            const timeA = dateA
                              ? new Date(dateA).getTime()
                              : Number.MAX_SAFE_INTEGER;
                            const timeB = dateB
                              ? new Date(dateB).getTime()
                              : Number.MAX_SAFE_INTEGER;

                            if (timeA !== timeB) return timeA - timeB;

                            return a.id - b.id;
                          });
                        const progress = getMonthProgress(periodTasks);
                        const opened = openedCards[phase.key]?.[idx];
                        return (
                          <Card
                            key={period.label}
                            radius="xl"
                            p="lg"
                            withBorder
                            style={{
                              background: "var(--marriplan-surface)",
                              borderColor: "var(--marriplan-border)",
                              boxShadow: "var(--marriplan-shadow)",
                            }}
                          >
                            <Box
                              mb="md"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 12,
                              }}
                            >
                              <Group gap={10} align="center" wrap="nowrap">
                                <ActionIcon
                                  variant="light"
                                  size="sm"
                                  radius="xl"
                                  onClick={() => handleToggle(phase.key, idx)}
                                  aria-label={opened ? "Fechar" : "Abrir"}
                                  visibleFrom="xs"
                                  styles={{
                                    root: {
                                      backgroundColor:
                                        "var(--marriplan-champagne)",
                                      color: "var(--marriplan-rose)",
                                      border:
                                        "1px solid var(--marriplan-border)",
                                    },
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      transform: opened
                                        ? "rotate(90deg)"
                                        : "rotate(0deg)",
                                      transition: "transform 0.2s",
                                    }}
                                  >
                                    <IconChevronRight size={14} />
                                  </span>
                                </ActionIcon>
                                <Title order={5} style={{ margin: 0 }}>
                                  {period.label}
                                </Title>
                              </Group>
                              <Box style={{ flex: "0 0 auto", minWidth: 56 }}>
                                <RingProgress
                                  size={56}
                                  thickness={6}
                                  sections={[
                                    {
                                      value: progress,
                                      color: getProgressColor(progress),
                                    },
                                  ]}
                                  label={
                                    <Text
                                      size="xs"
                                      fw={700}
                                      ta="center"
                                      style={{ lineHeight: 1 }}
                                    >
                                      {progress}%
                                    </Text>
                                  }
                                />
                              </Box>
                            </Box>
                            <Collapse in={opened} transitionDuration={200}>
                              <Group mb="sm" justify="space-between">
                                <Button
                                  leftSection={<IconPlus size={14} />}
                                  size="xs"
                                  styles={primaryButtonStyles}
                                  onClick={() =>
                                    handleAddTask(periodTasks[0]?.month || 0)
                                  }
                                >
                                  Adicionar tarefa
                                </Button>
                                <Text size="xs" c="dimmed">
                                  {periodTasks.length} tarefa(s)
                                </Text>
                              </Group>
                              {periodTasks.length === 0 ? (
                                <Text size="sm" c="dimmed">
                                  Nenhuma tarefa para este período.
                                </Text>
                              ) : (
                                <Stack>
                                  {periodTasks.map((task) => (
                                    <Group
                                      key={task.id}
                                      onClick={() => handleToggleDone(task)}
                                      style={{
                                        borderBottom:
                                          "1px solid var(--marriplan-border)",
                                        padding: "8px 6px",
                                        cursor:
                                          loadingTaskId === task.id
                                            ? "wait"
                                            : "pointer",
                                      }}
                                      role="button"
                                      tabIndex={0}
                                      aria-label={`Marcar tarefa ${task.description} como concluída`}
                                      onKeyDown={(event) => {
                                        if (
                                          event.key === "Enter" ||
                                          event.key === " "
                                        ) {
                                          event.preventDefault();
                                          handleToggleDone(task);
                                        }
                                      }}
                                    >
                                      <Group
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                      >
                                        <Checkbox
                                          checked={task.status === "done"}
                                          onClick={(event) =>
                                            event.stopPropagation()
                                          }
                                          onChange={() =>
                                            handleToggleDone(task)
                                          }
                                          disabled={loadingTaskId === task.id}
                                          size="xs"
                                          styles={{
                                            input: {
                                              borderColor:
                                                "var(--marriplan-border)",
                                              "&:checked": {
                                                backgroundColor:
                                                  "var(--marriplan-rose)",
                                                borderColor:
                                                  "var(--marriplan-rose)",
                                              },
                                            },
                                            icon: {
                                              color: "#fff",
                                            },
                                          }}
                                        />
                                        <Text
                                          size="sm"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleToggleDone(task);
                                          }}
                                          c={
                                            task.status === "done"
                                              ? "dimmed"
                                              : undefined
                                          }
                                          style={{
                                            textDecoration:
                                              task.status === "done"
                                                ? "line-through"
                                                : undefined,
                                            cursor:
                                              loadingTaskId === task.id
                                                ? "wait"
                                                : "pointer",
                                          }}
                                        >
                                          {task.description}
                                        </Text>
                                        <MarriplanStatusBadge
                                          kind="checklist"
                                          status={task.status}
                                          size="xs"
                                        />
                                        {!task.is_template && (
                                          <TooltipMantine label="Editar">
                                            <ActionIcon
                                              variant="subtle"
                                              styles={actionIconEditStyles}
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleEditTask(task);
                                              }}
                                              disabled={
                                                loadingTaskId === task.id
                                              }
                                              size="xs"
                                            >
                                              <IconEdit size={14} />
                                            </ActionIcon>
                                          </TooltipMantine>
                                        )}
                                        {!task.is_template && (
                                          <TooltipMantine label="Excluir">
                                            <ActionIcon
                                              variant="subtle"
                                              styles={actionIconDangerStyles}
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                handleDeleteTask(task.id);
                                              }}
                                              disabled={
                                                loadingTaskId === task.id
                                              }
                                              size="xs"
                                            >
                                              <IconTrash size={14} />
                                            </ActionIcon>
                                          </TooltipMantine>
                                        )}
                                      </Group>
                                      {loadingTaskId === task.id && (
                                        <Loader size={14} />
                                      )}
                                    </Group>
                                  ))}
                                </Stack>
                              )}
                            </Collapse>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  </Tabs.Panel>
                );
              })}
            </Tabs>
          )}
          <ChecklistTaskModal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSaveTask}
            initial={editingTask || undefined}
          />
        </Stack>
      </Box>
      <style jsx global>{`
        @keyframes target-badge {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7);
          }
          100% {
            box-shadow: 0 0 0 6px rgba(255, 193, 7, 0);
          }
        }
        .checklist-tabs .mantine-Tabs-tab[data-active] {
          background-color: #fffaf6 !important;
          color: var(--marriplan-text) !important;
          box-shadow: inset 0 0 0 1px var(--marriplan-border) !important;
        }
        .checklist-tabs .mantine-Tabs-tab[data-active] .mantine-Tabs-tabLabel {
          color: var(--marriplan-text) !important;
        }
      `}</style>
    </BaseLayout>
  );
}
