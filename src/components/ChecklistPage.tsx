import { useEffect, useState, useRef } from 'react';
import { fetchChecklistTasks } from '@/services/checklist';
import { ChecklistTask, MONTHS } from '@/types/checklist';
import { Group, Title, Progress, Card, Button, Select, Text, Stack, Loader, Box, SimpleGrid, Badge } from '@mantine/core';
import { IconChecklist, IconPlus } from '@tabler/icons-react';
import ChecklistTaskModal from './ChecklistTaskModal';
import { IconCheck, IconEdit, IconTrash, IconFileDownload, IconSearch } from '@tabler/icons-react';
import { createChecklistTask, updateChecklistTask, deleteChecklistTask } from '@/services/checklist';
import { TextInput, Checkbox, ActionIcon, Tooltip as TooltipMantine } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import BaseLayout from './Layout/_BaseLayout';
import dayjs from 'dayjs';
import { useMediaQuery } from '@mantine/hooks';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

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
  // Nova lógica de agrupamento baseada em month e days_before_event
  const PERIODS = [
    { label: '12 meses antes', test: (t: ChecklistTask) => t.month === 12, month: 12, days_before_event: 0 },
    { label: '11 meses antes', test: (t: ChecklistTask) => t.month === 11, month: 11, days_before_event: 0 },
    { label: '10 meses antes', test: (t: ChecklistTask) => t.month === 10, month: 10, days_before_event: 0 },
    { label: '9 meses antes', test: (t: ChecklistTask) => t.month === 9, month: 9, days_before_event: 0 },
    { label: '8 meses antes', test: (t: ChecklistTask) => t.month === 8, month: 8, days_before_event: 0 },
    { label: '7 meses antes', test: (t: ChecklistTask) => t.month === 7, month: 7, days_before_event: 0 },
    { label: '6 meses antes', test: (t: ChecklistTask) => t.month === 6, month: 6, days_before_event: 0 },
    { label: '5 meses antes', test: (t: ChecklistTask) => t.month === 5, month: 5, days_before_event: 0 },
    { label: '4 meses antes', test: (t: ChecklistTask) => t.month === 4, month: 4, days_before_event: 0 },
    { label: '3 meses antes', test: (t: ChecklistTask) => t.month === 3, month: 3, days_before_event: 0 },
    { label: '2 meses antes', test: (t: ChecklistTask) => t.month === 2, month: 2, days_before_event: 0 },
    { label: '1 mês antes', test: (t: ChecklistTask) => t.month === 1, month: 1, days_before_event: 0 },
    { label: '15 dias antes', test: (t: ChecklistTask) => t.days_before_event === 15, month: 0, days_before_event: 15 },
    { label: '10 dias antes', test: (t: ChecklistTask) => t.days_before_event === 10, month: 0, days_before_event: 10 },
    { label: '1 semana antes', test: (t: ChecklistTask) => t.days_before_event === 7, month: 0, days_before_event: 7 },
    { label: '5 dias antes', test: (t: ChecklistTask) => t.days_before_event === 5, month: 0, days_before_event: 5 },
    { label: '2 dias antes', test: (t: ChecklistTask) => t.days_before_event === 2, month: 0, days_before_event: 2 },
    { label: '1 dia antes', test: (t: ChecklistTask) => t.days_before_event === 1, month: 0, days_before_event: 1 },
    { label: 'Após o casamento', test: (t: ChecklistTask) => t.days_before_event === -1, month: 0, days_before_event: -1 }
  ];

  const tasksByPeriod = PERIODS.map(period => ({
    label: period.label,
    tasks: filteredTasks.filter(period.test)
  }));

  // Gráfico de barras: mostrar apenas meses
  const chartData = {
    labels: MONTHS,
    datasets: [{
      label: 'Tarefas concluídas',
      data: MONTHS.map((_, idx) => filteredTasks.filter(t => t.month === 12 - idx && t.status === 'done').length),
      backgroundColor: '#40c057',
    }, {
      label: 'Total de tarefas',
      data: MONTHS.map((_, idx) => filteredTasks.filter(t => t.month === 12 - idx).length),
      backgroundColor: '#228be6',
    }],
  };

  // Calcula progresso por mês
  function getMonthProgress(monthTasks: ChecklistTask[]) {
    if (!monthTasks.length) return 0;
    const done = monthTasks.filter(t => t.status === 'done').length;
    return Math.round((done / monthTasks.length) * 100);
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
        <Box mb={24} style={{ maxWidth: '90%'}}>
          <Bar data={chartData} options={{ plugins: { legend: { display: true } }, responsive: true, maintainAspectRatio: false, height: 300 }} />
        </Box>
        {loading ? <Loader /> : (
          <SimpleGrid cols={isMobile ? 1 : 2} spacing="md" verticalSpacing="md">
            {tasksByPeriod.map(({ label, tasks }) => (
              <Card key={label} shadow="xs" mb={8}>
                <Group position="apart" mb={8}>
                  <Title order={4}>{label}</Title>
                  <Progress value={getMonthProgress(tasks)} w={isMobile ? 80 : 120} size={isMobile ? 'sm' : 'md'} />
                  <Button leftSection={<IconPlus size={14} />} size="xs" variant="light" onClick={() => handleAddTask(tasks[0]?.month || 0)}>
                    Adicionar tarefa
                  </Button>
                </Group>
                {tasks.length === 0 ? (
                  <Text size="sm" c="dimmed">Nenhuma tarefa para este período.</Text>
                ) : (
                  <Stack spacing={4}>
                    {tasks.map(task => (
                      <Group key={task.id} position="apart" style={{ borderBottom: '1px solid #eee', padding: 4 }}>
                        <Group>
                          <Checkbox checked={task.status === 'done'} onChange={() => handleToggleDone(task)} disabled={loadingTaskId === task.id} size="xs" />
                          <Text size="sm" style={{ textDecoration: task.status === 'done' ? 'line-through' : undefined }}>{task.description}</Text>
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
              </Card>
            ))}
          </SimpleGrid>
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
