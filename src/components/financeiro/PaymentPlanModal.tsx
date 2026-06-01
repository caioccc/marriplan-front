import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  criarParcelaPagamento,
  FormaPagamento,
  gerarPreviaPlano,
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
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type PaymentPlanModalProps = {
  opened: boolean;
  mode: "plan" | "manual";
  weddingSupplierId?: number | null;
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
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
  { value: "60", label: "60 dias" },
  { value: "90", label: "90 dias" },
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

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "R$ 0,00";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return "R$ 0,00";
  }
  return numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  return typeof value === "number" ? value : Number(String(value).replace(",", "."));
}

export function PaymentPlanModal({
  opened,
  mode,
  weddingSupplierId,
  onClose,
  onSaved,
}: PaymentPlanModalProps) {
  const [loadingSupplier, setLoadingSupplier] = useState(false);
  const [weddingSupplier, setWeddingSupplier] = useState<WeddingSupplier | null>(null);
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
  const planTarget = toNumber(weddingSupplier?.valor_combinado);
  const planMatches = planPreview.length > 0 && Math.abs(planTotal - planTarget) < 0.01 && planPreviewValid;

  const handleGeneratePreview = async () => {
    if (!weddingSupplier) return;
    setPreviewLoading(true);
    try {
      const response = await gerarPreviaPlano({
        fornecedor_id: weddingSupplier.id,
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
      notifications.show({ color: "red", message: "Nao foi possivel gerar a previa do plano." });
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
      notifications.show({ color: "green", message: "Plano salvo com sucesso." });
      onSaved?.();
      onClose();
    } catch {
      notifications.show({ color: "red", message: "Nao foi possivel salvar o plano." });
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
      notifications.show({ color: "green", message: "Parcela adicionada manualmente." });
      onSaved?.();
      onClose();
    } catch {
      notifications.show({ color: "red", message: "Nao foi possivel adicionar a parcela." });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === "plan" ? "Criar Plano de Pagamento" : "Adicionar Parcela Manual"}
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
                  Valor acordado
                </Text>
                <Title order={4}>{formatCurrency(weddingSupplier.valor_combinado)}</Title>
              </Card>
              <Card radius="lg" withBorder>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Valor pago
                </Text>
                <Title order={4}>{formatCurrency(weddingSupplier.valor_pago)}</Title>
              </Card>
              <Card radius="lg" withBorder>
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                  Saldo devedor
                </Text>
                <Title order={4}>{formatCurrency(weddingSupplier.saldo_devedor)}</Title>
              </Card>
            </Group>

            {mode === "plan" ? (
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
                    label="N de parcelas"
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
                  <TextInput
                    label="1a parcela"
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
                    <ScrollArea type="auto" style={{ maxHeight: 360 }}>
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
                                      current.filter((_, itemIndex) => itemIndex !== index),
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
                        {planMatches ? "Bate com o valor acordado" : "Soma divergente"}
                      </Badge>
                    </Group>
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
            )}
          </>
        ) : (
          <Text c="dimmed">Fornecedor nao encontrado.</Text>
        )}
      </Stack>
    </Modal>
  );
}
