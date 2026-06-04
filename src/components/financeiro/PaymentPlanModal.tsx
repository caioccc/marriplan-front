import {
  badgeStyles,
  inputStyles,
  primaryButtonStyles,
  softButtonStyles,
} from "@/styles";
import {
  criarParcelaPagamento,
  FormaPagamento,
  ParcelaStatus,
  salvarPlanoPagamento,
} from "@/services/financeiro";
import { getWeddingSupplier, WeddingSupplier } from "@/services/suppliers";
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
  Stepper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconPlus,
  IconTrash,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MobileFullscreenModal } from "../MobileFullscreenModal";
import { useMediaQuery } from "@mantine/hooks";
import { DatePickerInput, DatesProvider } from "@mantine/dates";

type PaymentPlanModalProps = {
  opened: boolean;
  mode: "plan" | "manual";
  weddingSupplierId?: number | null;
  valorCombinadoOverride?: number | null;
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
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "transferencia", label: "Transferência" },
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
  const [activeStep, setActiveStep] = useState(0);
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
        message: "Não foi possível carregar o plano do fornecedor.",
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
      setActiveStep(0);
    }
  }, [opened]);

  const planTotal = useMemo(
    () => planPreview.reduce((sum, row) => sum + toNumber(row.valor), 0),
    [planPreview],
  );

  const displayedValorCombinado = valorCombinadoOverride
    ? valorCombinadoOverride
    : weddingSupplier?.valor_combinado;
  const planTarget = toNumber(displayedValorCombinado);
  const valorPago = toNumber(weddingSupplier?.valor_pago);
  const displayedSaldo = valorCombinadoOverride
    ? planTarget - valorPago
    : toNumber(weddingSupplier?.saldo_devedor);

  const planMatches =
    planPreview.length > 0 &&
    Math.abs(planTotal - planTarget) < 0.01 &&
    planPreviewValid;

  useEffect(() => {
    const previewTotal = planPreview.reduce(
      (sum, row) => sum + toNumber(row.valor),
      0,
    );
    setPlanPreviewValid(
      planPreview.length > 0 && Math.abs(previewTotal - planTarget) < 0.01,
    );
  }, [planPreview, planTarget]);

  const handleGeneratePreview = async () => {
    const valorCombinado = toNumber(displayedValorCombinado);
    const entradaPercentual = Number(planForm.entrada_percentual);
    const quantidadeParcelas = Number(planForm.quantidade_parcelas);
    const intervaloDias = Number(planForm.intervalo_dias);
    const dataPrimeiraParcela = planForm.data_primeira_parcela;

    if (Number.isNaN(valorCombinado) || valorCombinado <= 0) {
      notifications.show({
        color: "red",
        message: "Valor combinado inválido.",
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
        message: "Percentual de entrada inválido (0 a 100).",
      });
      return;
    }
    if (Number.isNaN(quantidadeParcelas) || quantidadeParcelas <= 0) {
      notifications.show({
        color: "red",
        message: "Quantidade de parcelas inválida.",
      });
      return;
    }
    if (Number.isNaN(intervaloDias) || intervaloDias <= 0) {
      notifications.show({
        color: "red",
        message: "Intervalo de pagamento inválido.",
      });
      return;
    }
    if (!dataPrimeiraParcela) {
      notifications.show({
        color: "red",
        message: "Data da primeira parcela obrigatória.",
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

      setPlanPreview(preview);
      setActiveStep(1); // Avança automaticamente para os Cards de Prévia
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível gerar a prévia do plano.",
      });
      setPlanPreview([]);
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
        message: "Não foi possível salvar o plano.",
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
        message: "Não foi possível adicionar a parcela.",
      });
    }
  };

  const isMobile = useMediaQuery("(max-width: 768px)");

  // --- RENDERS DA ETAPA DE CONTEXTO DO PLANO (STEP 0 E STEP 1) ---
  const renderStep0Form = (isMobileView: boolean) => (
    <Stack gap="md">
      <Group grow={!isMobileView}>
        <TextInput
          label="Entrada (%)"
          type="number"
          min={0}
          max={100}
          value={planForm.entrada_percentual}
          onChange={(event) =>
            setPlanForm((c) => ({
              ...c,
              entrada_percentual: event.currentTarget.value,
            }))
          }
          styles={inputStyles}
        />
        <TextInput
          label="Nº de parcelas"
          type="number"
          min={1}
          value={planForm.quantidade_parcelas}
          onChange={(event) =>
            setPlanForm((c) => ({
              ...c,
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
            setPlanForm((c) => ({ ...c, intervalo_dias: value || "30" }))
          }
          styles={inputStyles}
        />
      </Group>
      <Group grow={!isMobileView}>
        <DatesProvider settings={{ locale: "pt-br" }}>
          <DatePickerInput
            label="1ª parcela"
            valueFormat="DD/MM/YYYY"
            value={planForm.data_primeira_parcela}
            onChange={(value) =>
              setPlanForm((c) => ({
                ...c,
                data_primeira_parcela: value ? value : c.data_primeira_parcela,
              }))
            }
          />
        </DatesProvider>
        <Select
          label="Forma padrão"
          data={FORMA_OPTIONS}
          value={planForm.forma_pagamento}
          onChange={(value) =>
            setPlanForm((c) => ({
              ...c,
              forma_pagamento: (value as FormaPagamento) || "pix",
            }))
          }
          styles={inputStyles}
        />
      </Group>
      {!isMobileView && (
        <Group justify="flex-end" mt="md">
          <Button variant="default" styles={softButtonStyles} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            styles={primaryButtonStyles}
            onClick={() => void handleGeneratePreview()}
            loading={previewLoading}
            rightSection={<IconArrowRight size={16} />}
          >
            Gerar prévia das parcelas
          </Button>
        </Group>
      )}
    </Stack>
  );

  const renderStep1Preview = (isMobileView: boolean) => (
    <Stack gap="sm">
      <ScrollArea type="auto" styles={{ viewport: { paddingBottom: 12 } }}>
        <Stack gap="sm">
          {planPreview.map((row, index) => (
            <Card
              key={`${row.numero_parcela}-${index}`}
              radius="md"
              withBorder
              p="sm"
            >
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={700}>
                    Item #{index + 1} -{" "}
                    {row.numero_parcela === 0 ? "Entrada" : "Parcela"}
                  </Text>
                  <Button
                    variant="light"
                    color="red"
                    size="xs"
                    onClick={() =>
                      setPlanPreview((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    <IconTrash size={14} />
                  </Button>
                </Group>

                {isMobileView ? (
                  // Mobile stack vertical do card
                  <Stack gap="xs">
                    <TextInput
                      label="Descrição"
                      value={row.descricao}
                      onChange={(e) =>
                        setPlanPreview((curr) =>
                          curr.map((item, i) =>
                            i === index
                              ? { ...item, descricao: e.currentTarget.value }
                              : item,
                          ),
                        )
                      }
                      styles={inputStyles}
                    />
                    <Group grow gap="xs">
                      <DatesProvider settings={{ locale: "pt-br" }}>
                        <DatePickerInput
                          valueFormat="DD/MM/YYYY"
                          label="Vencimento"
                          value={row.data_vencimento}
                          onChange={(e) =>
                            setPlanPreview((curr) =>
                              curr.map((item, i) =>
                                i === index
                                  ? ({
                                      ...item,
                                      data_vencimento: e,
                                    } as PlanEditorRow)
                                  : item,
                              ),
                            )
                          }
                          styles={inputStyles}
                        />
                      </DatesProvider>
                      <TextInput
                        label="Valor"
                        value={row.valor}
                        onChange={(e) =>
                          setPlanPreview((curr) =>
                            curr.map((item, i) =>
                              i === index
                                ? { ...item, valor: e.currentTarget.value }
                                : item,
                            ),
                          )
                        }
                        styles={inputStyles}
                      />
                    </Group>
                    <Select
                      label="Forma"
                      data={FORMA_OPTIONS}
                      value={row.forma_pagamento}
                      onChange={(val) =>
                        setPlanPreview((curr) =>
                          curr.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  forma_pagamento:
                                    (val as FormaPagamento) || "pix",
                                }
                              : item,
                          ),
                        )
                      }
                      styles={inputStyles}
                    />
                  </Stack>
                ) : (
                  // Desktop linha horizontal simplificada por card
                  <Group gap="sm" grow>
                    <TextInput
                      label="Descrição"
                      value={row.descricao}
                      onChange={(e) =>
                        setPlanPreview((curr) =>
                          curr.map((item, i) =>
                            i === index
                              ? { ...item, descricao: e.currentTarget.value }
                              : item,
                          ),
                        )
                      }
                      styles={inputStyles}
                    />
                    <DatesProvider settings={{ locale: "pt-br" }}>
                      <DatePickerInput
                        label="Vencimento"
                        valueFormat="DD/MM/YYYY"
                        value={row.data_vencimento}
                        onChange={(val) =>
                          val &&
                          setPlanPreview((curr) =>
                            curr.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    data_vencimento: val,
                                  }
                                : item,
                            ),
                          )
                        }
                        styles={inputStyles}
                      />
                    </DatesProvider>
                    <TextInput
                      label="Valor"
                      value={row.valor}
                      onChange={(e) =>
                        setPlanPreview((curr) =>
                          curr.map((item, i) =>
                            i === index
                              ? { ...item, valor: e.currentTarget.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="0.00"
                      rightSection={<span style={{ paddingRight: 8 }}>R$</span>}
                      styles={inputStyles}
                    />
                    <Select
                      label="Forma"
                      data={FORMA_OPTIONS}
                      value={row.forma_pagamento}
                      onChange={(val) =>
                        setPlanPreview((curr) =>
                          curr.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  forma_pagamento:
                                    (val as FormaPagamento) || "pix",
                                }
                              : item,
                          ),
                        )
                      }
                      styles={inputStyles}
                    />
                  </Group>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      </ScrollArea>

      <Divider />
      <Group justify="space-between" align="center">
        <Text fw={600}>Total do Plano: {formatCurrency(planTotal)}</Text>
        <Badge
          style={
            planMatches ? badgeStyles.success.root : badgeStyles.danger.root
          }
        >
          {planMatches ? "Bate com o valor acordado" : "Soma divergente"}
        </Badge>
      </Group>

      {!isMobileView && (
        <Group justify="space-between" mt="md">
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => setActiveStep(0)}
          >
            Voltar
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
      )}
    </Stack>
  );

  const renderManualForm = () => (
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
        <TextInput />
        <DatesProvider settings={{ locale: "pt-br" }}>
          <DatePickerInput
            valueFormat="DD/MM/YYYY"
            onChange={(value) =>
              setPlanForm((c) => ({
                ...c,
                data_primeira_parcela: value ? value : c.data_primeira_parcela,
              }))
            }
            label="Vencimento"
            value={manualForm.data_vencimento}
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
        <Button variant="default" styles={softButtonStyles} onClick={onClose}>
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
  );

  const renderHeaderCards = (isMobileView: boolean) => (
    <Group
      grow={!isMobileView}
      wrap={isMobileView ? "wrap" : "nowrap"}
      gap="sm"
    >
      <Card
        radius="lg"
        withBorder
        style={{ flex: isMobileView ? "1 1 40%" : "1 1 40%" }}
      >
        <Text size="xs" tt="uppercase" fw={700} c="dimmed">
          Valor combinado
        </Text>
        <Title order={4}>{formatCurrency(displayedValorCombinado)}</Title>
      </Card>
      <Card
        radius="lg"
        withBorder
        style={{ flex: isMobileView ? "1 1 40%" : "1 1 40%" }}
      >
        <Text size="xs" tt="uppercase" fw={700} c="dimmed">
          Valor pago
        </Text>
        <Title order={4}>{formatCurrency(weddingSupplier?.valor_pago)}</Title>
      </Card>
      <Card
        radius="lg"
        withBorder
        style={{ flex: isMobileView ? "1 1 100%" : "1 1 100%" }}
      >
        <Text size="xs" tt="uppercase" fw={700} c="dimmed">
          Saldo devedor
        </Text>
        <Title order={4}>{formatCurrency(displayedSaldo)}</Title>
      </Card>
    </Group>
  );

  // --- VIEW DESKTOP ---
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
            <Text c="dimmed">Carregando informações...</Text>
          ) : weddingSupplier ? (
            <>
              {mode === "plan" ? (
                <Stepper
                  active={activeStep}
                  onStepClick={setActiveStep}
                  allowNextStepsSelect={false}
                  size="xs"
                >
                  <Stepper.Step
                    label="Configuração"
                    description="Dados base do plano"
                  >
                    <Stack gap="md" mt="md">
                      {renderStep0Form(false)}
                    </Stack>
                  </Stepper.Step>

                  <Stepper.Step
                    label="Prévia das Parcelas"
                    description="Edite e valide os itens"
                  >
                    <Stack gap="md" mt="md">
                      {renderStep1Preview(false)}
                    </Stack>
                  </Stepper.Step>
                </Stepper>
              ) : (
                renderManualForm()
              )}
            </>
          ) : (
            <Text c="dimmed">Fornecedor não encontrado.</Text>
          )}
        </Stack>
      </Modal>
    );
  }

  // --- VIEW MOBILE ---
  return (
    <MobileFullscreenModal
      opened={opened}
      onClose={onClose}
      title={
        mode === "plan"
          ? "Criar Plano de Pagamento"
          : "Adicionar Parcela Manual"
      }
      footer={
        activeStep === 0 && mode === "plan" ? (
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
              onClick={() => void handleGeneratePreview()}
              loading={previewLoading}
              rightSection={<IconArrowRight size={16} />}
            >
              Gerar prévia das parcelas
            </Button>
          </Group>
        ) : activeStep === 1 && mode === "plan" ? (
          <Group justify="space-between" mt="md">
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => setActiveStep(0)}
            >
              Voltar
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
        ) : null
      }
    >
      <Stack gap="md">
        {loadingSupplier ? (
          <Text c="dimmed">Carregando informações...</Text>
        ) : weddingSupplier ? (
          <>
            {mode === "plan" ? (
              <Stepper
                active={activeStep}
                onStepClick={setActiveStep}
                allowNextStepsSelect={false}
                size="xs"
              >
                <Stepper.Step label="Dados" description="Configurar">
                  <Stack gap="md" mt="md">
                    {renderStep0Form(true)}
                  </Stack>
                </Stepper.Step>

                <Stepper.Step label="Prévia" description="Validar e Salvar">
                  <Stack gap="md" mt="md">
                    {renderStep1Preview(true)}
                  </Stack>
                </Stepper.Step>
              </Stepper>
            ) : (
              renderManualForm()
            )}
          </>
        ) : (
          <Text c="dimmed">Fornecedor não encontrado.</Text>
        )}
      </Stack>
    </MobileFullscreenModal>
  );
}
