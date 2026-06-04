import BaseLayout from "@/components/Layout/_BaseLayout";
import PageSectionHeader from "@/components/PageSectionHeader";
import {
  atualizarParcelaPagamento,
  criarParcelaPagamento,
  FinanceSummary,
  FormaPagamento,
  gerarPreviaPlano,
  listParcelasPagamento,
  ParcelaPagamento,
  ParcelaStatus,
  PlanoPagamentoSalvarPayload,
  registrarPagamento,
  removerParcelaPagamento,
  reverterPagamento,
  salvarPlanoPagamento,
} from "@/services/financeiro";
import { getWeddingSupplier, WeddingSupplier } from "@/services/suppliers";
import {
  badgeStyles,
  inputStyles,
  primaryButtonStyles,
  softButtonStyles,
} from "@/styles";
import { dueColor, statusLabel, SupplierParcelRow } from "@/utils/financeiro";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Menu,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowRight,
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { BadgeDollarSignIcon, DollarSignIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

type StatusFilter = "" | ParcelaStatus;
type WindowFilter = "7" | "15" | "30" | "60" | "90" | "99999";

type PlanEditorRow = {
  numero_parcela: number;
  descricao: string;
  valor: string;
  data_vencimento: string;
  forma_pagamento: FormaPagamento;
  status?: ParcelaStatus;
  observacao?: string;
};

const WINDOW_OPTIONS: Array<{ value: WindowFilter; label: string }> = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
  { value: "60", label: "60 dias" },
  { value: "90", label: "90 dias" },
  { value: "99999", label: "Todo o período" },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "", label: "Todas" },
  { value: "a_vencer", label: "A vencer" },
  { value: "em_atraso", label: "Em atraso" },
  { value: "pago", label: "Pago" },
];

const FORMA_OPTIONS: Array<{ value: FormaPagamento; label: string }> = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cheque", label: "Cheque" },
  { value: "outro", label: "Outro" },
];

function formatCurrency(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "R$ 0,00";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return "R$ 0,00";
  }
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function toNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  return typeof value === "number"
    ? value
    : Number(String(value).replace(",", "."));
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function toDateInputValue(value?: string | null) {
  if (!value) return todayInputValue();
  return value.slice(0, 10);
}

export default function FinanceiroPage() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [items, setItems] = useState<ParcelaPagamento[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [windowFilter, setWindowFilter] = useState<WindowFilter>("7");
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [managerSupplier, setManagerSupplier] =
    useState<WeddingSupplier | null>(null);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editingRowOpen, setEditingRowOpen] = useState(false);
  const [activeParcela, setActiveParcela] = useState<SupplierParcelRow | null>(
    null,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [parcelaToDelete, setParcelaToDelete] =
    useState<SupplierParcelRow | null>(null);
  const [confirmRevertOpen, setConfirmRevertOpen] = useState(false);
  const [parcelaToRevert, setParcelaToRevert] =
    useState<SupplierParcelRow | null>(null);
  const [planPreview, setPlanPreview] = useState<PlanEditorRow[]>([]);
  const [planPreviewValid, setPlanPreviewValid] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [planForm, setPlanForm] = useState({
    entrada_percentual: "20",
    quantidade_parcelas: "4",
    intervalo_dias: "30",
    data_primeira_parcela: todayInputValue(),
    forma_pagamento: "pix" as FormaPagamento,
  });
  const [manualForm, setManualForm] = useState<PlanEditorRow>({
    numero_parcela: 1,
    descricao: "Parcela manual",
    valor: "0,00",
    data_vencimento: todayInputValue(),
    forma_pagamento: "pix",
    status: "a_vencer",
    observacao: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    data_pagamento: todayInputValue(),
    valor: "0,00",
    observacao: "",
  });

  const loadParcelas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listParcelasPagamento({
        status: statusFilter,
        window_days: windowFilter,
      });
      setItems(response.results || []);
      setSummary(response.summary);
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível carregar o painel financeiro.",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, windowFilter]);

  useEffect(() => {
    void loadParcelas();
  }, [loadParcelas]);

  useEffect(() => {
    const fornecedorParam = router.query.fornecedor;
    if (!fornecedorParam || typeof fornecedorParam !== "string") return;
    const fornecedorId = Number(fornecedorParam);
    if (!Number.isFinite(fornecedorId)) return;
    void openManager(fornecedorId);
    if (router.query.modo === "manual") {
      setManualOpen(true);
    }
  }, [router.query.fornecedor, router.query.modo]);

  const openManager = async (fornecedorId: number) => {
    setManagerLoading(true);
    setManagerOpen(true);
    try {
      const fornecedor = await getWeddingSupplier(fornecedorId);
      setManagerSupplier(fornecedor);
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível carregar o plano do fornecedor.",
      });
    } finally {
      setManagerLoading(false);
    }
  };

  const openPaymentModal = (parcela: SupplierParcelRow) => {
    setActiveParcela(parcela);
    setPaymentForm({
      data_pagamento: todayInputValue(),
      valor: String(parcela.valor),
      observacao: parcela.observacao || "",
    });
    setPaymentOpen(true);
  };

  const openEditModal = (parcela: SupplierParcelRow) => {
    setActiveParcela(parcela);
    setManualForm({
      numero_parcela: parcela.numero_parcela,
      descricao: parcela.descricao,
      valor: String(parcela.valor),
      data_vencimento: toDateInputValue(parcela.data_vencimento),
      forma_pagamento: parcela.forma_pagamento,
      status: parcela.status,
      observacao: parcela.observacao || "",
    });
    setEditingRowOpen(true);
  };

  const handleGeneratePreview = async () => {
    if (!managerSupplier) return;
    setPreviewLoading(true);
    try {
      const response = await gerarPreviaPlano({
        fornecedor_id: managerSupplier.id,
        entrada_percentual: Number(planForm.entrada_percentual),
        quantidade_parcelas: Number(planForm.quantidade_parcelas),
        intervalo_dias: Number(planForm.intervalo_dias),
        data_primeira_parcela: planForm.data_primeira_parcela,
        forma_pagamento: planForm.forma_pagamento,
      });
      setPlanPreview(
        (response.parcelas || []).map((item) => ({
          numero_parcela: item.numero_parcela,
          descricao: item.descricao,
          valor: String(item.valor),
          data_vencimento: item.data_vencimento,
          forma_pagamento: item.forma_pagamento,
          status: item.status,
          observacao: item.observacao || "",
        })),
      );
      setPlanPreviewValid(Boolean(response.validacao_ok));
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível gerar a prévia do plano.",
      });
      setPlanPreviewValid(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const planTotal = useMemo(
    () => planPreview.reduce((sum, row) => sum + toNumber(row.valor), 0),
    [planPreview],
  );
  const planTarget = toNumber(managerSupplier?.valor_combinado);
  const planMatches =
    planPreview.length > 0 &&
    Math.abs(planTotal - planTarget) < 0.01 &&
    planPreviewValid;
  const managerParcelas = (managerSupplier?.parcelas ||
    []) as SupplierParcelRow[];

  const handleSavePlan = async () => {
    if (!managerSupplier) return;
    setPlanSaving(true);
    try {
      const payload: PlanoPagamentoSalvarPayload = {
        fornecedor_id: managerSupplier.id,
        parcelas: planPreview.map((row) => ({
          numero_parcela: row.numero_parcela,
          descricao: row.descricao,
          valor: row.valor,
          data_vencimento: row.data_vencimento,
          forma_pagamento: row.forma_pagamento,
          status: row.status,
          observacao: row.observacao,
        })),
      };
      await salvarPlanoPagamento(payload);
      notifications.show({
        color: "green",
        message: "Plano salvo com sucesso.",
      });
      setCreatePlanOpen(false);
      setManagerOpen(false);
      await loadParcelas();
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível salvar o plano.",
      });
    } finally {
      setPlanSaving(false);
    }
  };

  const handleCreateManual = async () => {
    if (!managerSupplier) return;
    try {
      const payload = {
        fornecedor: managerSupplier.id,
        numero_parcela: manualForm.numero_parcela,
        descricao: manualForm.descricao,
        valor: manualForm.valor,
        data_vencimento: manualForm.data_vencimento,
        data_pagamento: null,
        forma_pagamento: manualForm.forma_pagamento,
        status: manualForm.status || "a_vencer",
        observacao: manualForm.observacao || "",
      } satisfies Parameters<typeof criarParcelaPagamento>[0];
      await criarParcelaPagamento(payload);
      notifications.show({
        color: "green",
        message: "Parcela adicionada manualmente.",
      });
      setManualOpen(false);
      await Promise.all([loadParcelas(), openManager(managerSupplier.id)]);
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível adicionar a parcela.",
      });
    }
  };

  const handleUpdateManual = async () => {
    if (!activeParcela) return;
    try {
      await atualizarParcelaPagamento(activeParcela.id, {
        numero_parcela: manualForm.numero_parcela,
        descricao: manualForm.descricao,
        valor: manualForm.valor,
        data_vencimento: manualForm.data_vencimento,
        forma_pagamento: manualForm.forma_pagamento,
        status: manualForm.status,
        observacao: manualForm.observacao || "",
      });
      notifications.show({ color: "green", message: "Parcela atualizada." });
      setEditingRowOpen(false);
      await Promise.all([
        loadParcelas(),
        managerSupplier ? openManager(managerSupplier.id) : Promise.resolve(),
      ]);
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível atualizar a parcela.",
      });
    }
  };

  const handlePay = async () => {
    if (!activeParcela) return;
    try {
      await registrarPagamento(activeParcela.id, {
        data_pagamento: paymentForm.data_pagamento,
        valor: paymentForm.valor,
        observacao: paymentForm.observacao,
        forma_pagamento: activeParcela.forma_pagamento,
      });
      notifications.show({ color: "green", message: "Pagamento registrado." });
      setPaymentOpen(false);
      await Promise.all([
        loadParcelas(),
        managerSupplier ? openManager(managerSupplier.id) : Promise.resolve(),
      ]);
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível registrar o pagamento.",
      });
    }
  };

  const handleRevert = async (parcela: SupplierParcelRow) => {
    try {
      await reverterPagamento(parcela.id);
      notifications.show({ color: "green", message: "Pagamento revertido." });
      await Promise.all([
        loadParcelas(),
        managerSupplier ? openManager(managerSupplier.id) : Promise.resolve(),
      ]);
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível reverter o pagamento.",
      });
    }
  };

  const handleDelete = async (parcela: SupplierParcelRow) => {
    try {
      await removerParcelaPagamento(parcela.id);
      notifications.show({ color: "green", message: "Parcela removida." });
      await Promise.all([
        loadParcelas(),
        managerSupplier ? openManager(managerSupplier.id) : Promise.resolve(),
      ]);
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível remover a parcela.",
      });
    }
  };

  const confirmDeleteParcela = async () => {
    if (!parcelaToDelete) return;
    setConfirmDeleteOpen(false);
    try {
      await handleDelete(parcelaToDelete);
    } finally {
      setParcelaToDelete(null);
    }
  };

  const confirmRevertParcela = async () => {
    if (!parcelaToRevert) return;
    setConfirmRevertOpen(false);
    try {
      await handleRevert(parcelaToRevert);
    } finally {
      setParcelaToRevert(null);
    }
  };

  return (
    <BaseLayout>
      <Stack gap="lg" py="md">
        <PageSectionHeader
          eyebrow="Gestão financeira"
          title="Painel Financeiro"
          description="Centralize vencimentos, saldos devedores e ações de pagamento dos fornecedores contratados."
          actions={
            <Button
              leftSection={<BadgeDollarSignIcon size={18} />}
              styles={primaryButtonStyles}
              onClick={() => {
                router.push("/financeiro/simulacao");
              }}
            >
              Simular Custos
            </Button>
          }
          filters={
            <Group grow align="flex-end" wrap="wrap">
              <Select
                label="Status"
                data={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter((value as StatusFilter) || "")
                }
                styles={inputStyles}
                allowDeselect={false}
              />
              <Select
                label="Janela de Tempo"
                data={WINDOW_OPTIONS}
                value={windowFilter}
                onChange={(value) =>
                  setWindowFilter((value as WindowFilter) || "7")
                }
                styles={inputStyles}
                allowDeselect={false}
              />
            </Group>
          }
        />
        {isMobile ? (
          <Stack gap="sm" p="md">
            <Card radius="xl" p="lg" withBorder>
              <Stack gap={6}>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  A vencer (7 dias)
                </Text>
                <Title order={3}>
                  {formatCurrency(summary?.upcoming_7_days.total)}
                </Title>
                <Text size="sm" c="dimmed">
                  {summary?.upcoming_7_days.count || 0} parcelas
                </Text>
              </Stack>
            </Card>
            <Card radius="xl" p="lg" withBorder>
              <Stack gap={6}>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Em atraso
                </Text>
                <Title order={3}>
                  {formatCurrency(summary?.overdue.total)}
                </Title>
                <Text size="sm" c="dimmed">
                  {summary?.overdue.count || 0} parcelas
                </Text>
              </Stack>
            </Card>
            <Card radius="xl" p="lg" withBorder>
              <Stack gap={6}>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Selecionados
                </Text>
                <Title order={3}>
                  {formatCurrency(summary?.selected.total)}
                </Title>
                <Text size="sm" c="dimmed">
                  {summary?.selected.count || 0} parcelas visíveis
                </Text>
              </Stack>
            </Card>
            <Card radius="xl" p="lg" withBorder>
              <Stack gap={6}>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Valor total
                </Text>
                <Title order={3}>
                  {summary?.total_contracted != null
                    ? formatCurrency(summary.total_contracted)
                    : "-"}
                </Title>
                <Text size="sm" c="dimmed">
                  Valor contratado
                </Text>
              </Stack>
            </Card>
          </Stack>
        ) : (
          <Group grow align="stretch" wrap="wrap">
            <Card radius="xl" p="lg" withBorder>
              <Stack gap={6}>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  A vencer (7 dias)
                </Text>
                <Title order={3}>
                  {formatCurrency(summary?.upcoming_7_days.total)}
                </Title>
                <Text size="sm" c="dimmed">
                  {summary?.upcoming_7_days.count || 0} parcelas
                </Text>
              </Stack>
            </Card>
            <Card radius="xl" p="lg" withBorder>
              <Stack gap={6}>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Em atraso
                </Text>
                <Title order={3}>
                  {formatCurrency(summary?.overdue.total)}
                </Title>
                <Text size="sm" c="dimmed">
                  {summary?.overdue.count || 0} parcelas
                </Text>
              </Stack>
            </Card>
            <Card radius="xl" p="lg" withBorder>
              <Stack gap={6}>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Selecionados
                </Text>
                <Title order={3}>
                  {formatCurrency(summary?.selected.total)}
                </Title>
                <Text size="sm" c="dimmed">
                  {summary?.selected.count || 0} parcelas visíveis
                </Text>
              </Stack>
            </Card>
            <Card radius="xl" p="lg" withBorder>
              <Stack gap={6}>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Valor total
                </Text>
                <Title order={3}>
                  {summary?.total_contracted != null
                    ? formatCurrency(summary.total_contracted)
                    : "-"}
                </Title>
                <Text size="sm" c="dimmed">
                  Valor contratado
                </Text>
              </Stack>
            </Card>
          </Group>
        )}

        <Stack gap={4} mx="md">
          <Group justify="space-between" align="baseline">
            <Title
              order={2}
              size="h3"
              fw={700}
              style={{ color: "var(--marriplan-text, #2D2622)" }} // Usando seu tom 'ink'
            >
              Parcelas
            </Title>

            {/* Opcional: Contador discreto na direita */}
            <Text size="sm" c="dimmed" fw={500}>
              {items.length} parcelas visíveis
            </Text>
          </Group>

          {/* Opcional: Subtítulo descritivo */}
          <Text size="sm" style={{ color: "#6F6660" }}>
            Gerencie os pagamentos, prazos e status dos seus fornecedores
            contratados.
          </Text>
        </Stack>

        <Card radius="xl" p="0" withBorder style={{ overflow: "hidden" }}>
          <ScrollArea type="auto" style={{ minHeight: 420 }}>
            <Stack gap="sm" p="md">
              {items.map((record) => {
                const parcelaStatus =
                  record.status_calculado || record.status || "a_vencer";
                if (isMobile) {
                  return (
                    <Card key={record.id} radius="md" withBorder>
                      <Group align="center">
                        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                          <Text
                            fw={700}
                            lineClamp={1}
                            style={
                              record.status === "pago"
                                ? {
                                    textDecoration: "line-through",
                                    color: "var(--marriplan-muted)",
                                  }
                                : {}
                            }
                          >
                            {record.descricao}
                          </Text>
                          <Group gap={8} align="center">
                            <Text
                              size="xs"
                              c="dimmed"
                              style={
                                record.status === "pago"
                                  ? {
                                      textDecoration: "line-through",
                                      color: "var(--marriplan-muted)",
                                    }
                                  : {}
                              }
                            >
                              Venc:
                            </Text>
                            <Text
                              size="sm"
                              c={
                                parcelaStatus === "em_atraso"
                                  ? "red"
                                  : parcelaStatus === "pago"
                                  ? "var(--marriplan-muted)"
                                  : dueColor(record)
                              }
                              fw={600}
                              style={
                                record.status === "pago"
                                  ? {
                                      textDecoration: "line-through",
                                      color: "var(--marriplan-muted)",
                                    }
                                  : {}
                              }
                            >
                              {new Date(
                                `${record.data_vencimento}T00:00:00`,
                              ).toLocaleDateString("pt-BR")}
                            </Text>
                          </Group>
                          <Text
                            size="sm"
                            fw={600}
                            style={
                              record.status === "pago"
                                ? {
                                    textDecoration: "line-through",
                                    color: "var(--marriplan-muted)",
                                  }
                                : {}
                            }
                          >
                            {formatCurrency(record.valor)}
                          </Text>
                          <Text size="xs">
                            {FORMA_OPTIONS.find(
                              (item) => item.value === record.forma_pagamento,
                            )?.label || record.forma_pagamento}
                          </Text>
                        </Stack>

                        <Group gap={8}>
                          {/* <Badge color={statusColor(record.status)}>
                                        {statusLabel(record.status)}
                                      </Badge> */}
                          {record.status === "pago" ? (
                            <Button
                              styles={softButtonStyles}
                              size="xs"
                              leftSection={<IconRefresh size={12} />}
                              onClick={() => {
                                setParcelaToRevert(record);
                                setConfirmRevertOpen(true);
                              }}
                            >
                              Reverter
                            </Button>
                          ) : (
                            <Button
                              styles={primaryButtonStyles}
                              size="xs"
                              leftSection={<DollarSignIcon size={12} />}
                              onClick={() => openPaymentModal(record)}
                            >
                              Pagar
                            </Button>
                          )}
                          <Button
                            styles={softButtonStyles}
                            px={8}
                            size="xs"
                            onClick={() =>
                              record.fornecedor
                                ? openManager(record.fornecedor)
                                : undefined
                            }
                          >
                            <IconArrowRight size={16} />
                          </Button>
                        </Group>
                      </Group>
                      {record.observacao ? (
                        <Text size="sm" c="dimmed" mt="xs">
                          {record.observacao}
                        </Text>
                      ) : null}
                    </Card>
                  );
                }

                return (
                  <Card key={record.id} radius="md" withBorder p="md">
                    <Group
                      align="center"
                      justify="space-between"
                      gap="md"
                      style={{ width: "100%" }}
                    >
                      {/* Avatar alinhado ao topo */}
                      <Avatar
                        name={record.fornecedor_nome || "Fornecedor"}
                        size="lg"
                        radius="sm"
                        src={
                          record.fornecedor_resumo?.supplier_detail
                            ?.cover_image_url || undefined
                        }
                      />

                      {/* Stack de Textos do Meio */}
                      <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                        <Text
                          fw={600}
                          lineClamp={1}
                          style={
                            record.status === "pago"
                              ? {
                                  textDecoration: "line-through",
                                  color: "var(--marriplan-muted)",
                                  lineHeight: 1.2,
                                }
                              : {
                                  lineHeight: 1.2,
                                }
                          }
                        >
                          {record.fornecedor_nome || "Fornecedor"}
                        </Text>

                        <Text
                          size="sm"
                          c="dimmed"
                          lineClamp={2}
                          style={
                            record.status === "pago"
                              ? {
                                  textDecoration: "line-through",
                                  color: "var(--marriplan-muted)",
                                  lineHeight: 1.3,
                                  marginTop: 2,
                                }
                              : { lineHeight: 1.3, marginTop: 2 }
                          }
                        >
                          {record.descricao}
                        </Text>

                        <Group gap={8} align="center">
                          <Text
                            size="xs"
                            c="dimmed"
                            style={
                              record.status === "pago"
                                ? {
                                    textDecoration: "line-through",
                                    color: "var(--marriplan-muted)",
                                  }
                                : undefined
                            }
                          >
                            Venc:
                          </Text>
                          <Text
                            size="sm"
                            c={
                              parcelaStatus === "em_atraso"
                                ? "red"
                                : parcelaStatus === "pago"
                                ? "var(--marriplan-muted)"
                                : dueColor(record)
                            }
                            fw={600}
                            style={
                              record.status === "pago"
                                ? {
                                    textDecoration: "line-through",
                                    color: "var(--marriplan-muted)",
                                  }
                                : undefined
                            }
                          >
                            {new Date(
                              `${record.data_vencimento}T00:00:00`,
                            ).toLocaleDateString("pt-BR")}
                          </Text>
                          <Text size="xs" c="dimmed">
                            •
                          </Text>
                          <Text
                            size="sm"
                            fw={600}
                            style={
                              record.status === "pago"
                                ? {
                                    textDecoration: "line-through",
                                    color: "var(--marriplan-muted)",
                                  }
                                : undefined
                            }
                          >
                            {formatCurrency(record.valor)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            •
                          </Text>
                          <Text size="xs">
                            {FORMA_OPTIONS.find(
                              (item) => item.value === record.forma_pagamento,
                            )?.label || record.forma_pagamento}
                          </Text>
                        </Group>
                      </Stack>

                      <Group
                        gap={8}
                        align="center"
                        wrap="nowrap"
                        style={{ pt: 6, flexShrink: 0 }}
                      >
                        <Badge
                          style={
                            parcelaStatus === "pago"
                              ? badgeStyles.success.root
                              : parcelaStatus === "em_atraso"
                              ? badgeStyles.danger.root
                              : badgeStyles.warning.root
                          }
                        >
                          {statusLabel(parcelaStatus)}
                        </Badge>

                        {parcelaStatus === "pago" ? (
                          <Button
                            styles={softButtonStyles}
                            size="xs"
                            leftSection={<IconRefresh size={12} />}
                            onClick={() => {
                              setParcelaToRevert(record);
                              setConfirmRevertOpen(true);
                            }}
                          >
                            Reverter
                          </Button>
                        ) : (
                          <Button
                            styles={primaryButtonStyles}
                            size="xs"
                            leftSection={<DollarSignIcon size={12} />}
                            onClick={() => openPaymentModal(record)}
                          >
                            Pagar Parcela
                          </Button>
                        )}

                        <Tooltip
                          label="Abrir gerenciador do fornecedor"
                          withArrow
                        >
                          <Button
                            styles={softButtonStyles}
                            px={8}
                            size="xs"
                            style={{ minWidth: 38 }}
                            onClick={() =>
                              record.fornecedor
                                ? openManager(record.fornecedor)
                                : undefined
                            }
                            disabled={!record.fornecedor}
                          >
                            <IconArrowRight size={12} />
                          </Button>
                        </Tooltip>
                      </Group>
                    </Group>
                  </Card>
                );
              })}
            </Stack>
          </ScrollArea>
        </Card>
      </Stack>

      <Modal
        opened={managerOpen}
        onClose={() => setManagerOpen(false)}
        title="Visualizar Plano"
        centered
        size="xl"
      >
        <Stack gap="md">
          {managerLoading ? (
            <Text c="dimmed">Carregando plano...</Text>
          ) : managerSupplier ? (
            <>
              <Group
                grow={!isMobile}
                wrap={isMobile ? "wrap" : "nowrap"}
                gap="sm"
              >
                <Card
                  radius="lg"
                  withBorder
                  style={{ flex: isMobile ? "1 1 40%" : "1 1 40%" }}
                >
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Valor combinado
                  </Text>
                  <Title order={4}>
                    {formatCurrency(managerSupplier.valor_combinado)}
                  </Title>
                </Card>
                <Card
                  radius="lg"
                  withBorder
                  style={{ flex: isMobile ? "1 1 40%" : "1 1 40%" }}
                >
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Valor pago
                  </Text>
                  <Title order={4}>
                    {formatCurrency(managerSupplier.valor_pago)}
                  </Title>
                </Card>
                <Card
                  radius="lg"
                  withBorder
                  style={{ flex: isMobile ? "1 1 100%" : "1 1 100%" }}
                >
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Saldo devedor
                  </Text>
                  <Title order={4}>
                    {formatCurrency(managerSupplier.saldo_devedor)}
                  </Title>
                </Card>
              </Group>

              <Group justify="space-between" align="center">
                <Badge
                  style={
                    managerSupplier.status_financeiro === "Quitado"
                      ? badgeStyles.success.root
                      : managerSupplier.status_financeiro === "Em atraso"
                      ? badgeStyles.danger.root
                      : badgeStyles.warning.root
                  }
                >
                  {managerSupplier.status_financeiro || "Sem plano"}
                </Badge>
                {!managerParcelas.length ? (
                  <Group>
                    <Button
                      variant="default"
                      styles={softButtonStyles}
                      onClick={() => setCreatePlanOpen(true)}
                      leftSection={<IconPlus size={16} />}
                    >
                      Criar plano
                    </Button>
                  </Group>
                ) : null}
              </Group>

              {!managerParcelas.length ? (
                <Card radius="lg" withBorder>
                  <Stack gap="xs">
                    <Text fw={700}>Sem plano de pagamento definido.</Text>
                    <Text c="dimmed">
                      Crie um cronograma com entrada e parcelas para acompanhar
                      saldo devedor e vencimentos.
                    </Text>
                  </Stack>
                </Card>
              ) : null}

              <ScrollArea
                type="auto"
                styles={{ viewport: { paddingBottom: 12 } }}
              >
                <Stack gap="sm">
                  {managerParcelas
                    .slice()
                    .sort((a, b) => a.numero_parcela - b.numero_parcela)
                    .map((parcela) => {
                      const parcelaStatus =
                        parcela.status_calculado ||
                        parcela.status ||
                        "a_vencer";
                      return (
                        <Card key={parcela.id} radius="md" withBorder>
                          <Group noWrap align="center" justify="space-between">
                            <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                              <Text
                                fw={700}
                                lineClamp={1}
                                style={
                                  parcela.status === "pago"
                                    ? {
                                        textDecoration: "line-through",
                                        color: "var(--marriplan-muted)",
                                      }
                                    : {}
                                }
                              >
                                {parcela.descricao}
                              </Text>
                              <Group
                                gap={8}
                                align="center"
                                wrap="wrap"
                                style={
                                  parcela.status === "pago"
                                    ? {
                                        textDecoration: "line-through",
                                        color: "var(--marriplan-muted)",
                                      }
                                    : {}
                                }
                              >
                                <Text size="xs" c="dimmed">
                                  Venc:
                                </Text>
                                <Text
                                  size="sm"
                                  c={
                                    parcelaStatus === "em_atraso"
                                      ? "red"
                                      : parcelaStatus === "pago"
                                      ? "var(--marriplan-muted)"
                                      : dueColor(parcela)
                                  }
                                  fw={600}
                                >
                                  {new Date(
                                    `${parcela.data_vencimento}T00:00:00`,
                                  ).toLocaleDateString("pt-BR")}
                                </Text>
                                {!isMobile && (
                                  <>
                                    <Text size="xs" c="dimmed">
                                      •
                                    </Text>
                                    <Text
                                      size="sm"
                                      fw={600}
                                      style={
                                        parcela.status === "pago"
                                          ? {
                                              textDecoration: "line-through",
                                              color: "var(--marriplan-muted)",
                                            }
                                          : {}
                                      }
                                    >
                                      {formatCurrency(parcela.valor)}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      •
                                    </Text>
                                    <Text size="xs">
                                      {FORMA_OPTIONS.find(
                                        (item) =>
                                          item.value ===
                                          parcela.forma_pagamento,
                                      )?.label || parcela.forma_pagamento}
                                    </Text>
                                  </>
                                )}
                              </Group>
                              {isMobile && (
                                <Group gap={8} align="center">
                                  <Text
                                    size="sm"
                                    fw={600}
                                    style={
                                      parcela.status === "pago"
                                        ? {
                                            textDecoration: "line-through",
                                            color: "var(--marriplan-muted)",
                                          }
                                        : {}
                                    }
                                  >
                                    {formatCurrency(parcela.valor)}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    •
                                  </Text>
                                  <Text size="xs">
                                    {FORMA_OPTIONS.find(
                                      (item) =>
                                        item.value === parcela.forma_pagamento,
                                    )?.label || parcela.forma_pagamento}
                                  </Text>
                                </Group>
                              )}
                            </Stack>

                            <Group gap={8} noWrap>
                              {!isMobile && (
                                <Badge
                                  style={
                                    parcelaStatus === "pago"
                                      ? badgeStyles.success.root
                                      : parcelaStatus === "em_atraso"
                                      ? badgeStyles.danger.root
                                      : badgeStyles.warning.root
                                  }
                                >
                                  {statusLabel(parcelaStatus)}
                                </Badge>
                              )}
                              {parcelaStatus === "pago" ? (
                                <Button
                                  styles={softButtonStyles}
                                  size="xs"
                                  leftSection={<IconRefresh size={12} />}
                                  onClick={() => {
                                    setParcelaToRevert(parcela);
                                    setConfirmRevertOpen(true);
                                  }}
                                >
                                  Reverter
                                </Button>
                              ) : (
                                <Button
                                  styles={primaryButtonStyles}
                                  size="xs"
                                  leftSection={<DollarSignIcon size={12} />}
                                  onClick={() => openPaymentModal(parcela)}
                                >
                                  Pagar Parcela
                                </Button>
                              )}

                              <Menu withinPortal position="bottom-end">
                                <Menu.Target>
                                  <Button
                                    styles={softButtonStyles}
                                    px={8}
                                    size="xs"
                                  >
                                    <IconDotsVertical size={14} />
                                  </Button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={<IconEdit size={14} />}
                                    onClick={() => openEditModal(parcela)}
                                    disabled={parcelaStatus === "pago"}
                                  >
                                    Editar
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={<IconTrash size={14} />}
                                    color="red"
                                    onClick={() => {
                                      setParcelaToDelete(parcela);
                                      setConfirmDeleteOpen(true);
                                    }}
                                    disabled={parcelaStatus === "pago"}
                                  >
                                    Excluir
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Group>
                          </Group>
                          {parcela.observacao ? (
                            <Text size="sm" c="dimmed" mt="xs">
                              {parcela.observacao}
                            </Text>
                          ) : null}
                        </Card>
                      );
                    })}
                </Stack>
              </ScrollArea>
            </>
          ) : null}
        </Stack>
      </Modal>

      <Modal
        opened={createPlanOpen}
        onClose={() => setCreatePlanOpen(false)}
        title="Criar Plano de Pagamento"
        centered
        size="xl"
      >
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Entrada (%)"
              value={planForm.entrada_percentual}
              onChange={(event) =>
                setPlanForm((current) => ({
                  ...current,
                  entrada_percentual: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <TextInput
              label="Nº de parcelas"
              value={planForm.quantidade_parcelas}
              onChange={(event) =>
                setPlanForm((current) => ({
                  ...current,
                  quantidade_parcelas: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <Select
              label="Intervalo"
              data={WINDOW_OPTIONS}
              value={planForm.intervalo_dias as WindowFilter}
              onChange={(value) =>
                setPlanForm((current) => ({
                  ...current,
                  intervalo_dias: value || "30",
                }))
              }
              styles={inputStyles}
            />
          </Group>
          <Group grow>
            <TextInput
              label="1ª parcela"
              type="date"
              value={planForm.data_primeira_parcela}
              onChange={(event) =>
                setPlanForm((current) => ({
                  ...current,
                  data_primeira_parcela: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <Select
              label="Forma padrão"
              data={FORMA_OPTIONS}
              value={planForm.forma_pagamento}
              onChange={(value) =>
                setPlanForm((current) => ({
                  ...current,
                  forma_pagamento: (value as FormaPagamento) || "pix",
                }))
              }
              styles={inputStyles}
            />
          </Group>
          <Button
            onClick={() => void handleGeneratePreview()}
            loading={previewLoading}
            leftSection={<IconCheck size={16} />}
          >
            Gerar prévia das parcelas
          </Button>

          {planPreview.length ? (
            <Stack gap="sm">
              <ScrollArea type="auto">
                <Table withTableBorder withColumnBorders highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Descrição</Table.Th>
                      <Table.Th>Vencimento</Table.Th>
                      <Table.Th>Valor</Table.Th>
                      <Table.Th>Forma</Table.Th>
                      <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {planPreview.map((row, index) => (
                      <Table.Tr key={`${row.numero_parcela}-${index}`}>
                        <Table.Td>
                          <TextInput
                            value={row.descricao}
                            onChange={(event) =>
                              setPlanPreview((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        descricao: event.currentTarget.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                            styles={inputStyles}
                          />
                        </Table.Td>
                        <Table.Td>
                          <TextInput
                            type="date"
                            value={row.data_vencimento}
                            onChange={(event) =>
                              setPlanPreview((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        data_vencimento:
                                          event.currentTarget.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                            styles={inputStyles}
                          />
                        </Table.Td>
                        <Table.Td>
                          <TextInput
                            value={row.valor}
                            onChange={(event) =>
                              setPlanPreview((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        valor: event.currentTarget.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                            styles={inputStyles}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Select
                            data={FORMA_OPTIONS}
                            value={row.forma_pagamento}
                            onChange={(value) =>
                              setPlanPreview((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        forma_pagamento:
                                          (value as FormaPagamento) || "pix",
                                      }
                                    : item,
                                ),
                              )
                            }
                            styles={inputStyles}
                          />
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon
                            variant="light"
                            color="red"
                            aria-label="Excluir linha"
                            onClick={() =>
                              setPlanPreview((current) =>
                                current.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
              <Divider />
              <Group justify="space-between" align="center">
                <Text fw={600}>Total: {formatCurrency(planTotal)}</Text>
                <Badge
                  style={
                    planMatches
                      ? badgeStyles.success.root
                      : badgeStyles.danger.root
                  }
                >
                  {planMatches
                    ? "Bate com o valor acordado"
                    : "Soma divergente"}
                </Badge>
              </Group>
              <Group justify="flex-end">
                <Button
                  variant="default"
                  styles={softButtonStyles}
                  onClick={() => setCreatePlanOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  styles={primaryButtonStyles}
                  disabled={!planMatches}
                  loading={planSaving}
                  onClick={() => void handleSavePlan()}
                >
                  Salvar plano
                </Button>
              </Group>
            </Stack>
          ) : null}
        </Stack>
      </Modal>

      <Modal
        opened={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Adicionar Manualmente"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Número da parcela"
            value={String(manualForm.numero_parcela)}
            onChange={(event) =>
              setManualForm((current) => ({
                ...current,
                numero_parcela: Number(event.currentTarget.value),
              }))
            }
            styles={inputStyles}
          />
          <TextInput
            label="Descrição"
            value={manualForm.descricao}
            onChange={(event) =>
              setManualForm((current) => ({
                ...current,
                descricao: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
          />
          <Group grow>
            <TextInput
              label="Valor"
              value={manualForm.valor}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  valor: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <TextInput
              label="Vencimento"
              type="date"
              value={manualForm.data_vencimento}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  data_vencimento: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
          </Group>
          <Group grow>
            <Select
              label="Forma"
              data={FORMA_OPTIONS}
              value={manualForm.forma_pagamento}
              onChange={(value) =>
                setManualForm((current) => ({
                  ...current,
                  forma_pagamento: (value as FormaPagamento) || "pix",
                }))
              }
              styles={inputStyles}
            />
            <Select
              label="Status"
              data={[
                { value: "a_vencer", label: "A vencer" },
                { value: "em_atraso", label: "Em atraso" },
                { value: "pago", label: "Pago" },
              ]}
              value={manualForm.status || "a_vencer"}
              onChange={(value) =>
                setManualForm((current) => ({
                  ...current,
                  status: (value as ParcelaStatus) || "a_vencer",
                }))
              }
              styles={inputStyles}
            />
          </Group>
          <TextInput
            label="Observação"
            value={manualForm.observacao || ""}
            onChange={(event) =>
              setManualForm((current) => ({
                ...current,
                observacao: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
            placeholder="Detalhes como desconto, multa ou conta utilizada"
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              styles={softButtonStyles}
              onClick={() => setManualOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              styles={primaryButtonStyles}
              onClick={() => void handleCreateManual()}
            >
              Adicionar linha
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editingRowOpen}
        onClose={() => setEditingRowOpen(false)}
        title="Editar parcela"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Número da parcela"
            value={String(manualForm.numero_parcela)}
            onChange={(event) =>
              setManualForm((current) => ({
                ...current,
                numero_parcela: Number(event.currentTarget.value),
              }))
            }
            styles={inputStyles}
          />
          <TextInput
            label="Descrição"
            value={manualForm.descricao}
            onChange={(event) =>
              setManualForm((current) => ({
                ...current,
                descricao: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
          />
          <Group grow>
            <TextInput
              label="Valor"
              value={manualForm.valor}
              onChange={(event) =>
                setManualForm((current) => ({
                  ...current,
                  valor: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <DatesProvider settings={{ locale: "pt-br" }}>
              <DatePickerInput
                valueFormat="DD/MM/YYYY"
                label="Vencimento"
                value={manualForm.data_vencimento}
                onChange={(event) => {
                  setManualForm((prev) => ({
                    ...prev,
                    data_vencimento: event,
                  }));
                }}
                styles={inputStyles}
              />
            </DatesProvider>
          </Group>
          <Group grow>
            <Select
              label="Forma"
              data={FORMA_OPTIONS}
              value={manualForm.forma_pagamento}
              onChange={(value) =>
                setManualForm((current) => ({
                  ...current,
                  forma_pagamento: (value as FormaPagamento) || "pix",
                }))
              }
              styles={inputStyles}
            />
            <Select
              label="Status"
              data={[
                { value: "a_vencer", label: "A vencer" },
                { value: "em_atraso", label: "Em atraso" },
                { value: "pago", label: "Pago" },
              ]}
              value={manualForm.status || "a_vencer"}
              onChange={(value) =>
                setManualForm((current) => ({
                  ...current,
                  status: (value as ParcelaStatus) || "a_vencer",
                }))
              }
              styles={inputStyles}
            />
          </Group>
          <TextInput
            label="Observação"
            value={manualForm.observacao || ""}
            onChange={(event) =>
              setManualForm((current) => ({
                ...current,
                observacao: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              styles={softButtonStyles}
              onClick={() => setEditingRowOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              styles={primaryButtonStyles}
              onClick={() => void handleUpdateManual()}
            >
              Salvar alterações
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Registrar Pagamento"
        centered
      >
        <Stack gap="md">
          <Card radius="lg" withBorder>
            <Text fw={700}>{activeParcela?.descricao || "Parcela"}</Text>
            <Text size="sm" c="dimmed">
              Previsto: {formatCurrency(activeParcela?.valor)} via{" "}
              {FORMA_OPTIONS.find(
                (item) => item.value === activeParcela?.forma_pagamento,
              )?.label || "-"}
            </Text>
          </Card>
          <Group grow>
            <DatesProvider settings={{ locale: "pt-br" }}>
              <DatePickerInput
                label="Data do pagamento"
                value={paymentForm.data_pagamento}
                onChange={(event) =>
                  setPaymentForm((current) => ({
                    ...current,
                    data_pagamento: event,
                  }))
                }
                valueFormat="DD/MM/YYYY"
                styles={inputStyles}
              />
            </DatesProvider>
            <TextInput
              label="Valor pago"
              value={paymentForm.valor}
              onChange={(event) =>
                setPaymentForm((current) => ({
                  ...current,
                  valor: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
          </Group>
          <TextInput
            label="Observação"
            value={paymentForm.observacao}
            onChange={(event) =>
              setPaymentForm((current) => ({
                ...current,
                observacao: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
            placeholder="Desconto, multa ou conta utilizada"
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              styles={softButtonStyles}
              onClick={() => setPaymentOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              styles={primaryButtonStyles}
              onClick={() => void handlePay()}
            >
              Registrar pagamento
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Confirmar exclusão"
        centered
      >
        <Stack gap="md">
          <Text>
            Tem certeza que deseja excluir esta parcela? Esta ação não pode ser
            desfeita.
          </Text>
          <Group position="right">
            <Button
              variant="default"
              styles={softButtonStyles}
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button color="red" onClick={() => void confirmDeleteParcela()}>
              Excluir
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={confirmRevertOpen}
        onClose={() => setConfirmRevertOpen(false)}
        title="Confirmar reversão"
        centered
      >
        <Stack gap="md">
          <Text>Tem certeza que deseja reverter este pagamento?</Text>
          <Group position="right">
            <Button
              variant="default"
              styles={softButtonStyles}
              onClick={() => setConfirmRevertOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              styles={primaryButtonStyles}
              onClick={() => void confirmRevertParcela()}
            >
              Reverter
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseLayout>
  );
}
