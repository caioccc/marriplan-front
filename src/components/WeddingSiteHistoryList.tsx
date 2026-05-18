import {
  fetchWeddingSiteHistory,
  WeddingSiteHistoryResponse,
} from "@/services/weddingSiteHistory";
import {
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Timeline,
  Title
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const PERIOD_OPTIONS = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "custom", label: "Personalizado" },
];

const ACTION_ICONS = {
  create: <IconWorld size={16} color="#40c057" />,
  edit: <IconEdit size={16} color="#228be6" />,
  publish: <IconCheck size={16} color="#fab005" />,
  unpublish: <IconAlertCircle size={16} color="#fa5252" />,
  delete: <IconTrash size={16} color="#fa5252" />,
};

export default function WeddingSiteHistoryList() {
  const [history, setHistory] = useState<WeddingSiteHistoryResponse>({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("7d");
  const [search, setSearch] = useState("");
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchWeddingSiteHistory({
      period,
      start:
        period === "custom" && start
          ? dayjs(start).format("YYYY-MM-DD")
          : undefined,
      end:
        period === "custom" && end
          ? dayjs(end).format("YYYY-MM-DD")
          : undefined,
      search: search || undefined,
    })
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [period, start, end, search]);

  return (
    <Stack>
      <Group mb="md" align="center">
        <IconEdit size={28} style={{ marginRight: 8 }} />
        <Title order={2}>Histórico de Alterações do Site</Title>
      </Group>
      <Group>
        <Select
          label="Período"
          data={PERIOD_OPTIONS}
          value={period}
          onChange={(v) => setPeriod(v || "7d")}
          style={{ minWidth: 180 }}
        />
        {period === "custom" && (
          <>
            <DatePickerInput
              label="De"
              value={start}
              onChange={setStart}
              mx={4}
            />
            <DatePickerInput label="Até" value={end} onChange={setEnd} mx={4} />
          </>
        )}
        <TextInput
          label="Buscar descrição"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Digite para buscar..."
          style={{ minWidth: 220 }}
        />
      </Group>
      {loading ? (
        <Loader />
      ) : (
        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          {history.results.length === 0 && (
            <Timeline.Item title="Nenhuma alteração encontrada." />
          )}
          {history.results.map((h) => (
            <Timeline.Item
              key={h.id}
              bullet={ACTION_ICONS[h.action] || <IconEdit size={16} />}
              title={h.action_display}
            >
              <Text color="dimmed" size="sm">
                {h.description || <i>Sem descrição</i>}
              </Text>
              <Text size="xs" mt={4}>
                {dayjs(h.created_at).format("DD/MM/YYYY HH:mm")}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </Stack>
  );
}
