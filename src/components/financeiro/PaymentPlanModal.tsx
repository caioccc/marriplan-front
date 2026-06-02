import {
  criarParcelaPagamento,
  FormaPagamento,
  ParcelaStatus,
  salvarPlanoPagamento,
} from "@/services/financeiro";
import { getWeddingSupplier, WeddingSupplier } from "@/services/suppliers";
import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MobileFullscreenModal } from "../MobileFullscreenModal";

type PaymentPlanModalProps = {
  opened: boolean;
  mode: "plan" | "manual";
  weddingSupplierId?: number | null;
  valorCombinadoOverride?: string;
  onClose: () => void;
  onSaved?: () => void;
};

type PlanEditorRow = {
  numero_parcela: number;
  descricao: string;
  valor: string;
  data_vencimento: string;
  forma_pagamento: FormaPagamento;
  status?: ParcelaStatus;
  observacao?: string;
};

const WINDOW_OPTIONS = [
  { value: "7", label: "Semanal" },
  { value: "15", label: "Quinzenal" },
  { value: "30", label: "Mensal" },
];

const FORMA_OPTIONS: Array<{ value: FormaPagamento; label: string }> = [
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
  { value: "cartao_credito", label: "Cartao de Credito" },
  { value: "cartao_debito", label: "Cartao de Debito" },
  { value: "transferencia", label: "Transferencia" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cheque", label: "Cheque" },
  { value: "outro", label: "Outro" },
];

const STATUS_OPTIONS: Array<{ value: ParcelaStatus; label: string }> = [
  { value: "a_vencer", label: "A vencer" },
  { value: "em_atraso", label: "Em atraso" },
  { value: "pago", label: "Pago" },
];

function formatDateInput(date: Date) {
  date = new Date(date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function todayInputValue() {
  return formatDateInput(new Date());
}

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

function toCents(value: number) {
  return Math.round(value * 100);
}

function fromCents(cents: number) {
  return (cents / 100).toFixed(2);
}

function splitAmount(value: number, count: number) {
  if (count <= 0) return [];
  const totalCents = toCents(value);
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;
  return Array.from({ length: count }, (_, index) =>
    fromCents(base + (index === count - 1 ? remainder : 0)),
  );
}

function addDays(dateString: string, days: number) {
  const date = parseDateInput(dateString);
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
}

export function PaymentPlanModal({
  opened,
  mode,
  weddingSupplierId,
  valorCombinadoOverride,
  onClose,
  onSaved,
}: PaymentPlanModalProps) {
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [weddingSupplier, setWeddingSupplier] =
    useState<WeddingSupplier | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [planPreview, setPlanPreview] = useState<PlanEditorRow[]>([]);
  const [planPreviewValid, setPlanPreviewValid] = useState(false);
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

  const loadSupplier = useCallback(async () => {
    if (!weddingSupplierId) {
      setWeddingSupplier(null);
      return;
    }
    setLoadingSupplier(true);
    try {
      const supplier = await getWeddingSupplier(weddingSupplierId);
      setWeddingSupplier(supplier);
    } catch {
      notifications.show({
        color: "red",
        message: "Nao foi possivel carregar o plano do fornecedor.",
      });
    } finally {
      setLoadingSupplier(false);
    }
  }, [weddingSupplierId]);

  useEffect(() => {
    if (!opened) return;
    void loadSupplier();
  }, [opened, loadSupplier]);

  useEffect(() => {
    if (!opened) {
      setPlanPreview([]);
      setPlanPreviewValid(false);
    }
  }, [opened]);

  const planTotal = useMemo(
    () => planPreview.reduce((sum, row) => sum + toNumber(row.valor), 0),
    [planPreview],
  );
  const displayedValorCombinado = valorCombinadoOverride?.trim()
    ? valorCombinadoOverride
    : weddingSupplier?.valor_combinado;
  const planTarget = toNumber(displayedValorCombinado);
  const valorPago = toNumber(weddingSupplier?.valor_pago);
  const displayedSaldo = valorCombinadoOverride?.trim()
    ? planTarget - valorPago
    : toNumber(weddingSupplier?.saldo_devedor);
  const planMatches =
    planPreview.length > 0 &&
    Math.abs(planTotal - planTarget) < 0.01 &&
    planPreviewValid;

  const handleGeneratePreview = async () => {
    const valorCombinado = toNumber(displayedValorCombinado);
    const entradaPercentual = Number(planForm.entrada_percentual);
    const quantidadeParcelas = Number(planForm.quantidade_parcelas);
    const intervaloDias = Number(planForm.intervalo_dias);
    const dataPrimeiraParcela = planForm.data_primeira_parcela;

    if (Number.isNaN(valorCombinado) || valorCombinado <= 0) {
      notifications.show({
        color: "red",
        message: "Valor combinado invalido.",
      });
      return;
    }

    if (
      Number.isNaN(entradaPercentual) ||
      entradaPercentual < 0 ||
      entradaPercentual > 100
    ) {
      notifications.show({
        color: "red",
        message:
          "Percentual de entrada deve ser um numero positivo entre 0 e 100.",
      });
      return;
    }

    if (Number.isNaN(quantidadeParcelas) || quantidadeParcelas <= 0) {
      notifications.show({
        color: "red",
        message: "Quantidade de parcelas deve ser um numero positivo.",
      });
      return;
    }

    if (Number.isNaN(intervaloDias) || intervaloDias <= 0) {
      notifications.show({
        color: "red",
        message: "Intervalo de pagamento invalido.",
      });
      return;
    }

    if (!dataPrimeiraParcela) {
      notifications.show({
        color: "red",
        message: "Data da primeira parcela obrigatoria.",
      });
      return;
    }

    setPreviewLoading(true);
    try {
      const totalCents = toCents(valorCombinado);
      const entradaCents = Math.round(totalCents * (entradaPercentual / 100));
      const restanteCents = totalCents - entradaCents;
      const parcelasValores = splitAmount(
        restanteCents / 100,
        quantidadeParcelas,
      );

      const preview: PlanEditorRow[] = [];
      if (entradaCents > 0) {
        preview.push({
          numero_parcela: 0,
          descricao: "Entrada",
          valor: fromCents(entradaCents),
          data_vencimento: todayInputValue(),
          forma_pagamento: planForm.forma_pagamento,
          status: "a_vencer",
          observacao: "",
        });
      }

      parcelasValores.forEach((valor, index) => {
        preview.push({
          numero_parcela: index + 1,
          descricao: `Parcela ${index + 1}/${quantidadeParcelas}`,
          valor,
          data_vencimento: addDays(dataPrimeiraParcela, intervaloDias * index),
          forma_pagamento: planForm.forma_pagamento,
          status: "a_vencer",
          observacao: "",
        });
      });

      const previewTotal = preview.reduce(
        (sum, row) => sum + toNumber(row.valor),
        0,
      );
      setPlanPreview(preview);
      setPlanPreviewValid(
        preview.length > 0 && Math.abs(previewTotal - planTarget) < 0.01,
      );
    } catch {
      notifications.show({
        color: "red",
        message: "Nao foi possivel gerar a previa do plano.",
      });
      setPlanPreview([]);
      setPlanPreviewValid(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!weddingSupplier) return;
    setPlanSaving(true);
    try {
      await salvarPlanoPagamento({
        fornecedor_id: weddingSupplier.id,
        parcelas: planPreview.map((row) => ({
          numero_parcela: row.numero_parcela,
          descricao: row.descricao,
          valor: row.valor,
          data_vencimento: row.data_vencimento,
          forma_pagamento: row.forma_pagamento,
          status: row.status,
          observacao: row.observacao,
        })),
      });
      notifications.show({
        color: "green",
        message: "Plano salvo com sucesso.",
      });
      onSaved?.();
      onClose();
    } catch {
      notifications.show({
        color: "red",
        message: "Nao foi possivel salvar o plano.",
      });
    } finally {
      setPlanSaving(false);
    }
  };

  const handleCreateManual = async () => {
    if (!weddingSupplier) return;
    try {
      const payload = {
        fornecedor: weddingSupplier.id,
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
      onSaved?.();
      onClose();
    } catch {
      notifications.show({
        color: "red",
        message: "Nao foi possivel adicionar a parcela.",
      });
    }
  };

  const renderMobileFooter = () => {
    return (
      <Group justify="flex-end">
        <Button variant="default" styles={softButtonStyles} onClick={onClose}>
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
    );
  };

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!isMobile) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          mode === "plan"
            ? "Criar Plano de Pagamento"
            : "Adicionar Parcela Manual"
        }
        centered
        size="xl"
      >
        <Stack gap="md">
          {loadingSupplier ? (
            <Text c="dimmed">Carregando informacoes...</Text>
          ) : weddingSupplier ? (
            <>
              <Group grow>
                <Card radius="lg" withBorder>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Valor combinado
                  </Text>
                  <Title order={4}>
                    {formatCurrency(displayedValorCombinado)}
                  </Title>
                </Card>
                <Card radius="lg" withBorder>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Valor pago
                  </Text>
                  <Title order={4}>
                    {formatCurrency(weddingSupplier.valor_pago)}
                  </Title>
                </Card>
                <Card radius="lg" withBorder>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                    Saldo devedor
                  </Text>
                  <Title order={4}>{formatCurrency(displayedSaldo)}</Title>
                </Card>
              </Group>

              {mode === "plan" ? (
                <Stack gap="md">
                  <Group grow>
                    <TextInput
                      label="Entrada (%)"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
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
                      label="N de parcelas"
                      type="number"
                      min={1}
                      step={1}
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
                      value={planForm.intervalo_dias}
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
                    <DatesProvider settings={{ locale: "pt-br" }}>
                      <DatePickerInput
                        label="1a parcela"
                        valueFormat="DD/MM/YYYY"
                        value={parseDateInput(planForm.data_primeira_parcela)}
                        onChange={(value) => {
                          console.log("Data selecionada:", value);
                          setPlanForm((current) => ({
                            ...current,
                            data_primeira_parcela: value
                              ? value
                              : current.data_primeira_parcela,
                          }));
                        }}
                      />
                    </DatesProvider>
                    <Select
                      label="Forma padrao"
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
                    Gerar previa das parcelas
                  </Button>

                  {planPreview.length ? (
                    <Stack gap="sm">
                      <ScrollArea>
                        <Table
                          withTableBorder
                          withColumnBorders
                          highlightOnHover
                        >
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Descricao</Table.Th>
                              <Table.Th>Vencimento</Table.Th>
                              <Table.Th>Valor</Table.Th>
                              <Table.Th>Forma</Table.Th>
                              <Table.Th>Acoes</Table.Th>
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
                                                descricao:
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
                                  <DatesProvider settings={{ locale: "pt-br" }}>
                                    <DatePickerInput
                                      value={row.data_vencimento}
                                      valueFormat="DD/MM/YYYY"
                                      onChange={(event) => {
                                        setPlanPreview((current) =>
                                          current.map((item, itemIndex) =>
                                            itemIndex === index
                                              ? {
                                                  ...item,
                                                  data_vencimento: event,
                                                }
                                              : item,
                                          ),
                                        );
                                      }}
                                      styles={inputStyles}
                                    />
                                  </DatesProvider>
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
                                                valor:
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
                                                  (value as FormaPagamento) ||
                                                  "pix",
                                              }
                                            : item,
                                        ),
                                      )
                                    }
                                    styles={inputStyles}
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <Button
                                    variant="light"
                                    color="red"
                                    size="xs"
                                    leftSection={<IconTrash size={14} />}
                                    onClick={() =>
                                      setPlanPreview((current) =>
                                        current.filter(
                                          (_, itemIndex) => itemIndex !== index,
                                        ),
                                      )
                                    }
                                  >
                                    Excluir
                                  </Button>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </ScrollArea>
                      <Divider />
                      <Group justify="space-between" align="center">
                        <Text fw={600}>Total: {formatCurrency(planTotal)}</Text>
                        <Badge color={planMatches ? "green" : "red"}>
                          {planMatches
                            ? "Bate com o valor acordado"
                            : "Soma divergente"}
                        </Badge>
                      </Group>
                      <Group justify="flex-end">
                        <Button
                          variant="default"
                          styles={softButtonStyles}
                          onClick={onClose}
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
              ) : (
                <Stack gap="md">
                  <TextInput
                    label="Numero da parcela"
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
                    label="Descricao"
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
                      data={STATUS_OPTIONS}
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
                    label="Observacao"
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
                      onClick={onClose}
                    >
                      Cancelar
                    </Button>
                    <Button
                      styles={primaryButtonStyles}
                      leftSection={<IconPlus size={16} />}
                      onClick={() => void handleCreateManual()}
                    >
                      Adicionar linha
                    </Button>
                  </Group>
                </Stack>
              )}
            </>
          ) : (
            <Text c="dimmed">Fornecedor nao encontrado.</Text>
          )}
        </Stack>
      </Modal>
    );
  }

  return (
    <MobileFullscreenModal
      opened={opened}
      onClose={onClose}
      title={
        mode === "plan"
          ? "Criar Plano de Pagamento"
          : "Adicionar Parcela Manual"
      }
    >
      <Stack gap="md">
        {loadingSupplier ? (
          <Text c="dimmed">Carregando informacoes...</Text>
        ) : weddingSupplier ? (
          <>
            <Stack gap="md">
              <Card radius="lg" withBorder>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Valor combinado
                </Text>
                <Title order={4}>
                  {formatCurrency(displayedValorCombinado)}
                </Title>
              </Card>
              <Card radius="lg" withBorder>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Valor pago
                </Text>
                <Title order={4}>
                  {formatCurrency(weddingSupplier.valor_pago)}
                </Title>
              </Card>
              <Card radius="lg" withBorder>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Saldo devedor
                </Text>
                <Title order={4}>{formatCurrency(displayedSaldo)}</Title>
              </Card>
            </Stack>

            {mode === "plan" ? (
              <Stack gap="md">
                <Group grow>
                  <TextInput
                    label="Entrada (%)"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
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
                    label="N de parcelas"
                    type="number"
                    min={1}
                    step={1}
                    value={planForm.quantidade_parcelas}
                    onChange={(event) =>
                      setPlanForm((current) => ({
                        ...current,
                        quantidade_parcelas: event.currentTarget.value,
                      }))
                    }
                    styles={inputStyles}
                  />
                </Group>
                <Group grow>
                  <Select
                    label="Intervalo"
                    data={WINDOW_OPTIONS}
                    value={planForm.intervalo_dias}
                    onChange={(value) =>
                      setPlanForm((current) => ({
                        ...current,
                        intervalo_dias: value || "30",
                      }))
                    }
                    styles={inputStyles}
                  />
                  <Select
                    label="Forma padrao"
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

                <Group grow mb="xl">
                  <DatesProvider settings={{ locale: "pt-br" }}>
                    <DatePickerInput
                      valueFormat="DD/MM/YYYY"
                      label="1a parcela"
                      value={planForm.data_primeira_parcela}
                      onChange={(value) =>
                        setPlanForm((current) => ({
                          ...current,
                          data_primeira_parcela: value
                            ? value
                            : current.data_primeira_parcela,
                        }))
                      }
                      styles={inputStyles}
                    />
                  </DatesProvider>
                </Group>

                <Button
                  onClick={() => void handleGeneratePreview()}
                  loading={previewLoading}
                  leftSection={<IconCheck size={16} />}
                  mb="xl"
                >
                  Gerar previa das parcelas
                </Button>

                {planPreview.length ? (
                  <Stack gap="sm">
                    <ScrollArea>
                      <Table withTableBorder withColumnBorders highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Descricao</Table.Th>
                            <Table.Th>Vencimento</Table.Th>
                            <Table.Th>Valor</Table.Th>
                            <Table.Th>Forma</Table.Th>
                            <Table.Th>Acoes</Table.Th>
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
                                              descricao:
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
                                                (value as FormaPagamento) ||
                                                "pix",
                                            }
                                          : item,
                                      ),
                                    )
                                  }
                                  styles={inputStyles}
                                />
                              </Table.Td>
                              <Table.Td>
                                <Button
                                  variant="light"
                                  color="red"
                                  size="xs"
                                  leftSection={<IconTrash size={14} />}
                                  onClick={() =>
                                    setPlanPreview((current) =>
                                      current.filter(
                                        (_, itemIndex) => itemIndex !== index,
                                      ),
                                    )
                                  }
                                >
                                  Excluir
                                </Button>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                    <Divider />
                    <Group justify="space-between" align="center">
                      <Text fw={600}>Total: {formatCurrency(planTotal)}</Text>
                      <Badge color={planMatches ? "green" : "red"}>
                        {planMatches
                          ? "Bate com o valor acordado"
                          : "Soma divergente"}
                      </Badge>
                    </Group>
                    <Group justify="flex-end" mt="md">
                      <Button
                        variant="default"
                        styles={softButtonStyles}
                        onClick={onClose}
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
            ) : (
              <Stack gap="md">
                <TextInput
                  label="Numero da parcela"
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
                  label="Descricao"
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
                    data={STATUS_OPTIONS}
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
                  label="Observacao"
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
                    onClick={onClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    styles={primaryButtonStyles}
                    leftSection={<IconPlus size={16} />}
                    onClick={() => void handleCreateManual()}
                  >
                    Adicionar linha
                  </Button>
                </Group>
              </Stack>
            )}
          </>
        ) : (
          <Text c="dimmed">Fornecedor nao encontrado.</Text>
        )}
      </Stack>
    </MobileFullscreenModal>
  );
}
