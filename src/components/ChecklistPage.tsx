//eslint-disable react-hooks/exhaustive-deps
//eslint-disable @typescript-eslint/no-unused-vars
/* eslint-disable @typescript-eslint/no-explicit-any */
//eslint no-explicit-any: "off"
import { createChecklistTask, deleteChecklistTask, fetchChecklistTasks, updateChecklistTask } from '@/services/checklist';
import { ChecklistTask } from '@/types/checklist';
import { ActionIcon, Badge, Box, Button, Card, Checkbox, Collapse, Group, Loader, RingProgress, Select, SimpleGrid, Stack, Tabs, Text, TextInput, Title, Tooltip as TooltipMantine } from '@mantine/core';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';
import { IconEdit, IconFileDownload, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import ChecklistTaskModal from './ChecklistTaskModal';
import BaseLayout from './Layout/_BaseLayout';


export default function ChecklistPage() {
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ChecklistTask | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);
  const pendingBadgeRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    setLoading(true);
    fetchChecklistTasks()
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  // Filtros
  const filteredTasks = tasks.filter(t =>
    (!search || t.description.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || t.status === filterStatus) &&
    (!filterPriority || t.priority === filterPriority)
  );
  // Agrupamento por fases para Tabs (cada tab é um grupo de períodos)
  const PHASES = [
    {
      key: 'fase1',
      label: '12-10 meses antes',
      periods: [
        { label: '12 meses antes', test: (t: ChecklistTask) => t.month === 12 },
        { label: '11 meses antes', test: (t: ChecklistTask) => t.month === 11 },
        { label: '10 meses antes', test: (t: ChecklistTask) => t.month === 10 },
      ]
    },
    {
      key: 'fase2',
      label: '9-5 meses antes',
      periods: [
        { label: '9 meses antes', test: (t: ChecklistTask) => t.month === 9 },
        { label: '8 meses antes', test: (t: ChecklistTask) => t.month === 8 },
        { label: '7 meses antes', test: (t: ChecklistTask) => t.month === 7 },
        { label: '6 meses antes', test: (t: ChecklistTask) => t.month === 6 },
        { label: '5 meses antes', test: (t: ChecklistTask) => t.month === 5 },
      ]
    },
    {
      key: 'fase3',
      label: '4-1 mês antes',
      periods: [
        { label: '4 meses antes', test: (t: ChecklistTask) => t.month === 4 },
        { label: '3 meses antes', test: (t: ChecklistTask) => t.month === 3 },
        { label: '2 meses antes', test: (t: ChecklistTask) => t.month === 2 },
        { label: '1 mês antes', test: (t: ChecklistTask) => t.month === 1 },
      ]
    },
    {
      key: 'fase4',
      label: 'Dias finais e pós',
      periods: [
        { label: '15 dias antes', test: (t: ChecklistTask) => t.days_before_event === 15 },
        { label: '10 dias antes', test: (t: ChecklistTask) => t.days_before_event === 10 },
        { label: '1 semana antes', test: (t: ChecklistTask) => t.days_before_event === 7 },
        { label: '5 dias antes', test: (t: ChecklistTask) => t.days_before_event === 5 },
        { label: '2 dias antes', test: (t: ChecklistTask) => t.days_before_event === 2 },
        { label: '1 dia antes', test: (t: ChecklistTask) => t.days_before_event === 1 },
        { label: 'Após o casamento', test: (t: ChecklistTask) => t.days_before_event === -1 },
      ]
    }
  ];

  // Mapeamento dos períodos para exibição
  const PERIODS = [
    { label: '12 meses antes', test: (t: ChecklistTask) => t.month === 12 },
    { label: '11 meses antes', test: (t: ChecklistTask) => t.month === 11 },
    { label: '10 meses antes', test: (t: ChecklistTask) => t.month === 10 },
    { label: '9 meses antes', test: (t: ChecklistTask) => t.month === 9 },
    { label: '8 meses antes', test: (t: ChecklistTask) => t.month === 8 },
    { label: '7 meses antes', test: (t: ChecklistTask) => t.month === 7 },
    { label: '6 meses antes', test: (t: ChecklistTask) => t.month === 6 },
    { label: '5 meses antes', test: (t: ChecklistTask) => t.month === 5 },
    { label: '4 meses antes', test: (t: ChecklistTask) => t.month === 4 },
    { label: '3 meses antes', test: (t: ChecklistTask) => t.month === 3 },
    { label: '2 meses antes', test: (t: ChecklistTask) => t.month === 2 },
    { label: '1 mês antes', test: (t: ChecklistTask) => t.month === 1 },
    { label: '15 dias antes', test: (t: ChecklistTask) => t.days_before_event === 15 },
    { label: '10 dias antes', test: (t: ChecklistTask) => t.days_before_event === 10 },
    { label: '1 semana antes', test: (t: ChecklistTask) => t.days_before_event === 7 },
    { label: '5 dias antes', test: (t: ChecklistTask) => t.days_before_event === 5 },
    { label: '2 dias antes', test: (t: ChecklistTask) => t.days_before_event === 2 },
    { label: '1 dia antes', test: (t: ChecklistTask) => t.days_before_event === 1 },
    { label: 'Após o casamento', test: (t: ChecklistTask) => t.days_before_event === -1 }
  ];

  // Função para obter os períodos de cada fase
  function getPeriodsForPhase(phase: typeof PHASES[number]) {
    return phase.periods;
  }


  // Calcula progresso por mês
  function getMonthProgress(monthTasks: ChecklistTask[]) {
    if (!monthTasks.length) return 0;
    const done = monthTasks.filter(t => t.status === 'done').length;
    return Math.round((done / monthTasks.length) * 100);
  }

  // Cor do progresso gamificado
  function getProgressColor(progress: number) {
    if (progress === 100) return 'teal';
    if (progress >= 70) return 'blue';
    if (progress >= 30) return 'yellow';
    return 'red';
  }

  // Handlers
  function handleAddTask(month: number) {
    setEditingTask({
      id: 0,
      month,
      description: '',
      start_date: '',
      due_date: '',
      priority: 'medium',
      status: 'pending',
      is_template: false,
      attachments: [],
      created_at: '',
      updated_at: '',
    });
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
    fetchChecklistTasks().then(setTasks).finally(() => setLoading(false));
  }
  async function handleDeleteTask(id: number) {
    setLoadingTaskId(id);
    await deleteChecklistTask(id);
    fetchChecklistTasks().then(setTasks).finally(() => setLoadingTaskId(null));
  }
  async function handleToggleDone(task: ChecklistTask) {
    setLoadingTaskId(task.id);
    await updateChecklistTask(task.id, { status: task.status === 'done' ? 'pending' : 'done' });
    fetchChecklistTasks().then(setTasks).finally(() => setLoadingTaskId(null));
  }

  // Estado global de abertura dos cards: { [phaseKey]: boolean[] }
  const [openedCards, setOpenedCards] = useState<{ [phaseKey: string]: boolean[] }>(() => {
    const obj: { [phaseKey: string]: boolean[] } = {};
    PHASES.forEach(phase => {
      const periods = getPeriodsForPhase(phase);
      obj[phase.key] = periods.map(() => !isMobile);
    });
    return obj;
  });

  const handleToggle = (phaseKey: string, idx: number) => {
    setOpenedCards(prev => ({
      ...prev,
      [phaseKey]: prev[phaseKey].map((v, i) => i === idx ? !v : v)
    }));
  };

  return (
    <BaseLayout title="Checklist do Casamento">
      <Box>
        <Group mb="md" align="center">
          <Title order={2}>Checklist de Casamento</Title>
        </Group>
        <Group mb={16}>
          <TextInput leftSection={<IconSearch size={16} />} placeholder="Buscar tarefa..." value={search} onChange={e => setSearch(e.currentTarget.value)} w={220} />
          <Select
            data={[{ value: 'pending', label: 'Pendente' }, { value: 'in_progress', label: 'Em Andamento' }, { value: 'done', label: 'Concluído' }]}
            value={filterStatus}
            onChange={v => setFilterStatus(v || null)}
            placeholder="Status"
            clearable
            w={120}
          />
          <Select
            data={[{ value: 'high', label: 'Alta' }, { value: 'medium', label: 'Média' }, { value: 'low', label: 'Baixa' }]}
            value={filterPriority}
            onChange={v => setFilterPriority(v || null)}
            placeholder="Prioridade"
            clearable
            w={120}
          />
          <Button leftSection={<IconFileDownload size={18} />} variant="light" onClick={() => {
            const list = document.querySelector('.mantine-SimpleGrid-root');
            if (list) {
              const printWindow = window.open('', '', 'width=800,height=600');
              printWindow!.document.write('<html><head><title>Checklist</title></head><body>' + list.innerHTML + '</body></html>');
              printWindow!.document.close();
              printWindow!.print();
            }
          }}>
            Exportar PDF
          </Button>
        </Group>
        {loading ? <Loader /> : (
          <Tabs defaultValue={PHASES[0].key} variant="pills" keepMounted={false}>
            <Tabs.List mb="md">
              {PHASES.map(phase => (
                <Tabs.Tab key={phase.key} value={phase.key}>{phase.label}</Tabs.Tab>
              ))}
            </Tabs.List>
            {PHASES.map(phase => {
              const periods = getPeriodsForPhase(phase);
              return (
                <Tabs.Panel key={phase.key} value={phase.key}>
                  <SimpleGrid
                    cols={{ base: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
                    spacing="lg"
                    verticalSpacing="lg"
                  >
                    {periods.map((period, idx) => {
                      const periodTasks = filteredTasks.filter(period.test);
                      const progress = getMonthProgress(periodTasks);
                      const opened = openedCards[phase.key]?.[idx];
                      return (
                        <Card key={period.label} shadow="md" radius="md" p="md" withBorder>
                          <Box mb="sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Group gap={8} align="center">
                              <Button
                                variant="subtle"
                                size="xs"
                                px={4}
                                onClick={() => handleToggle(phase.key, idx)}
                                style={{ minWidth: 28 }}
                                aria-label={opened ? 'Fechar' : 'Abrir'}
                                visibleFrom="xs"
                              >
                                <span style={{ display: 'inline-block', transform: opened ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                              </Button>
                              <Title order={5} style={{ margin: 0 }}>{period.label}</Title>
                            </Group>
                            <RingProgress
                              size={48}
                              thickness={6}
                              sections={[{ value: progress, color: getProgressColor(progress) }]}
                              label={<Text size="xs" fw={700}>{progress}%</Text>}
                            />
                          </Box>
                          <Collapse in={opened} transitionDuration={200}>
                            <Group mb="xs" justify="space-between">
                              <Button leftSection={<IconPlus size={14} />} size="xs" variant="light" onClick={() => handleAddTask(periodTasks[0]?.month || 0)}>
                                Adicionar tarefa
                              </Button>
                            </Group>
                            {periodTasks.length === 0 ? (
                              <Text size="sm" c="dimmed">Nenhuma tarefa para este período.</Text>
                            ) : (
                              <Stack spacing={4}>
                                {periodTasks.map(task => (
                                  <Group key={task.id} position="apart" style={{ borderBottom: '1px solid #eee', padding: 4 }}>
                                    <Group>
                                      <Checkbox
                                        checked={task.status === 'done'}
                                        onChange={() => handleToggleDone(task)}
                                        disabled={loadingTaskId === task.id}
                                        size="xs"
                                        styles={{
                                          input: {
                                            accentColor: task.status === 'done' ? '#12b886' : undefined
                                          }
                                        }}
                                      />
                                      <Text
                                        size="sm"
                                        c={task.status === 'done' ? 'dimmed' : undefined}
                                        style={{ textDecoration: task.status === 'done' ? 'line-through' : undefined }}
                                      >
                                        {task.description}
                                      </Text>
                                      {!task.is_template && <TooltipMantine label="Editar"><ActionIcon onClick={() => handleEditTask(task)} disabled={loadingTaskId === task.id} size="xs"><IconEdit size={14} /></ActionIcon></TooltipMantine>}
                                      {!task.is_template && <TooltipMantine label="Excluir"><ActionIcon color="red" onClick={() => handleDeleteTask(task.id)} disabled={loadingTaskId === task.id} size="xs"><IconTrash size={14} /></ActionIcon></TooltipMantine>}
                                    </Group>
                                    <div ref={el => (pendingBadgeRef.current[task.id] = el)}>
                                      {loadingTaskId === task.id ? (
                                        <Loader size={14} />
                                      ) : (
                                        <Badge
                                          size="xs"
                                          color={task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'blue' : 'yellow'}
                                          variant={task.status === 'pending' ? 'filled' : 'light'}
                                          style={task.status === 'pending' ? { animation: 'target-badge 1s infinite alternate' } : {}}
                                        >
                                          {task.status === 'done' ? 'Concluído' : task.status === 'in_progress' ? 'Em andamento' : 'Pendente'}
                                        </Badge>
                                      )}
                                    </div>
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
      </Box>
      <style jsx global>{`
@keyframes target-badge {
  0% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
  100% { box-shadow: 0 0 0 6px rgba(255, 193, 7, 0); }
}
`}</style>
    </BaseLayout>
  );
}
