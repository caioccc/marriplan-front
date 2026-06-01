import BaseLayout from '@/components/Layout/_BaseLayout';
import PageSectionHeader from '@/components/PageSectionHeader';
import { inputStyles, primaryButtonStyles, softButtonStyles } from '@/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
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
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { notifications } from '@mantine/notifications';
import {
  IconArrowRight,
  IconCheck,
  IconCreditCard,
  IconPlus,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import {
  criarParcelaPagamento,
  FinanceSummary,
  FormaPagamento,
  gerarPreviaPlano,
  listParcelasPagamento,
  ParcelaPagamento,
  ParcelaStatus,
  PlanoPagamentoSalvarPayload,
  registrarPagamento,
  reverterPagamento,
  salvarPlanoPagamento,
  atualizarParcelaPagamento,
  removerParcelaPagamento,
} from '@/services/financeiro';
import { getWeddingSupplier, WeddingSupplier } from '@/services/suppliers';

type StatusFilter = '' | ParcelaStatus;
type WindowFilter = '7' | '15' | '30' | '60' | '90';

type PlanEditorRow = {
  numero_parcela: number;
  descricao: string;
  valor: string;
  data_vencimento: string;
  forma_pagamento: FormaPagamento;
  status?: ParcelaStatus;
  observacao?: string;
};

type SupplierParcelRow = {
  id: number;
  numero_parcela: number;
  descricao: string;
  valor: string | number;
  data_vencimento: string;
  forma_pagamento: FormaPagamento;
  status?: ParcelaStatus;
  status_calculado?: ParcelaStatus;
  observacao?: string | null;
};

const WINDOW_OPTIONS: Array<{ value: WindowFilter; label: string }> = [
  { value: '7', label: '7 dias' },
  { value: '15', label: '15 dias' },
  { value: '30', label: '30 dias' },
  { value: '60', label: '60 dias' },
  { value: '90', label: '90 dias' },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: '', label: 'Todas' },
  { value: 'a_vencer', label: 'A vencer' },
  { value: 'em_atraso', label: 'Em atraso' },
  { value: 'pago', label: 'Pago' },
];

const FORMA_OPTIONS: Array<{ value: FormaPagamento; label: string }> = [
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'outro', label: 'Outro' },
];

function formatCurrency(value?: string | number | null) {
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return 'R$ 0,00';
  }
  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function toNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  return typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function statusLabel(status?: ParcelaStatus) {
  if (status === 'pago') return 'Pago';
  if (status === 'em_atraso') return 'Em atraso';
  return 'A vencer';
}

function statusColor(status?: ParcelaStatus) {
  if (status === 'pago') return 'green';
  if (status === 'em_atraso') return 'red';
  return 'yellow';
}

function dueColor(parcela: Pick<SupplierParcelRow, 'status' | 'status_calculado' | 'data_vencimento'>) {
  const calculated = parcela.status_calculado || parcela.status;
  if (calculated === 'pago') return 'green';
  if (calculated === 'em_atraso') return 'red';
  const dueDate = new Date(`${parcela.data_vencimento}T00:00:00`);
  const diffDays = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'yellow';
  return 'teal';
}

function toDateInputValue(value?: string | null) {
  if (!value) return todayInputValue();
  return value.slice(0, 10);
}

export default function FinanceiroPage() {
  const router = useRouter();
  const [items, setItems] = useState<ParcelaPagamento[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [windowFilter, setWindowFilter] = useState<WindowFilter>('7');
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [managerSupplier, setManagerSupplier] = useState<WeddingSupplier | null>(null);
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editingRowOpen, setEditingRowOpen] = useState(false);
  const [activeParcela, setActiveParcela] = useState<SupplierParcelRow | null>(null);
  const [planPreview, setPlanPreview] = useState<PlanEditorRow[]>([]);
  const [planPreviewValid, setPlanPreviewValid] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [planForm, setPlanForm] = useState({
    entrada_percentual: '20',
    quantidade_parcelas: '4',
    intervalo_dias: '30',
    data_primeira_parcela: todayInputValue(),
    forma_pagamento: 'pix' as FormaPagamento,
  });
  const [manualForm, setManualForm] = useState<PlanEditorRow>({
    numero_parcela: 1,
    descricao: 'Parcela manual',
    valor: '0,00',
    data_vencimento: todayInputValue(),
    forma_pagamento: 'pix',
    status: 'a_vencer',
    observacao: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    data_pagamento: todayInputValue(),
    valor: '0,00',
    observacao: '',
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
      notifications.show({ color: 'red', message: 'Não foi possível carregar o painel financeiro.' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, windowFilter]);

  useEffect(() => {
    void loadParcelas();
  }, [loadParcelas]);

  useEffect(() => {
    const fornecedorParam = router.query.fornecedor;
    if (!fornecedorParam || typeof fornecedorParam !== 'string') return;
    const fornecedorId = Number(fornecedorParam);
    if (!Number.isFinite(fornecedorId)) return;
    void openManager(fornecedorId);
    if (router.query.modo === 'manual') {
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
      notifications.show({ color: 'red', message: 'Não foi possível carregar o plano do fornecedor.' });
    } finally {
      setManagerLoading(false);
    }
  };

  const openPaymentModal = (parcela: SupplierParcelRow) => {
    setActiveParcela(parcela);
    setPaymentForm({
      data_pagamento: todayInputValue(),
      valor: String(parcela.valor),
      observacao: parcela.observacao || '',
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
      observacao: parcela.observacao || '',
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
          observacao: item.observacao || '',
        })),
      );
      setPlanPreviewValid(Boolean(response.validacao_ok));
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível gerar a prévia do plano.' });
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
  const planMatches = planPreview.length > 0 && Math.abs(planTotal - planTarget) < 0.01 && planPreviewValid;
  const managerParcelas = (managerSupplier?.parcelas || []) as SupplierParcelRow[];

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
      notifications.show({ color: 'green', message: 'Plano salvo com sucesso.' });
      setCreatePlanOpen(false);
      setManagerOpen(false);
      await loadParcelas();
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível salvar o plano.' });
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
        status: manualForm.status || 'a_vencer',
        observacao: manualForm.observacao || '',
      } satisfies Parameters<typeof criarParcelaPagamento>[0];
      await criarParcelaPagamento(payload);
      notifications.show({ color: 'green', message: 'Parcela adicionada manualmente.' });
      setManualOpen(false);
      await Promise.all([loadParcelas(), openManager(managerSupplier.id)]);
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível adicionar a parcela.' });
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
        observacao: manualForm.observacao || '',
      });
      notifications.show({ color: 'green', message: 'Parcela atualizada.' });
      setEditingRowOpen(false);
      await Promise.all([loadParcelas(), managerSupplier ? openManager(managerSupplier.id) : Promise.resolve()]);
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível atualizar a parcela.' });
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
      notifications.show({ color: 'green', message: 'Pagamento registrado.' });
      setPaymentOpen(false);
      await Promise.all([loadParcelas(), managerSupplier ? openManager(managerSupplier.id) : Promise.resolve()]);
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível registrar o pagamento.' });
    }
  };

  const handleRevert = async (parcela: SupplierParcelRow) => {
    try {
      await reverterPagamento(parcela.id);
      notifications.show({ color: 'green', message: 'Pagamento revertido.' });
      await Promise.all([loadParcelas(), managerSupplier ? openManager(managerSupplier.id) : Promise.resolve()]);
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível reverter o pagamento.' });
    }
  };

  const handleDelete = async (parcela: SupplierParcelRow) => {
    try {
      await removerParcelaPagamento(parcela.id);
      notifications.show({ color: 'green', message: 'Parcela removida.' });
      await Promise.all([loadParcelas(), managerSupplier ? openManager(managerSupplier.id) : Promise.resolve()]);
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível remover a parcela.' });
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
            <Button leftSection={<IconRefresh size={18} />} styles={softButtonStyles} variant="default" onClick={() => void loadParcelas()}>
              Atualizar
            </Button>
          }
          filters={
            <Group grow align="flex-end" wrap="wrap">
              <Select
                label="Status"
                data={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(value) => setStatusFilter((value as StatusFilter) || '')}
                styles={inputStyles}
                allowDeselect={false}
              />
              <Select
                label="Janela de Tempo"
                data={WINDOW_OPTIONS}
                value={windowFilter}
                onChange={(value) => setWindowFilter((value as WindowFilter) || '7')}
                styles={inputStyles}
                allowDeselect={false}
              />
            </Group>
          }
        />

        <Group grow align="stretch" wrap="wrap">
          <Card radius="xl" p="lg" withBorder>
            <Stack gap={6}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">A vencer (7 dias)</Text>
              <Title order={3}>{formatCurrency(summary?.upcoming_7_days.total)}</Title>
              <Text size="sm" c="dimmed">{summary?.upcoming_7_days.count || 0} parcelas</Text>
            </Stack>
          </Card>
          <Card radius="xl" p="lg" withBorder>
            <Stack gap={6}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Em atraso</Text>
              <Title order={3}>{formatCurrency(summary?.overdue.total)}</Title>
              <Text size="sm" c="dimmed">{summary?.overdue.count || 0} parcelas</Text>
            </Stack>
          </Card>
          <Card radius="xl" p="lg" withBorder>
            <Stack gap={6}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Selecionados</Text>
              <Title order={3}>{formatCurrency(summary?.selected.total)}</Title>
              <Text size="sm" c="dimmed">{summary?.selected.count || 0} parcelas visíveis</Text>
            </Stack>
          </Card>
        </Group>

        <Card radius="xl" p="0" withBorder style={{ overflow: 'hidden' }}>
          <DataTable
            records={items}
            fetching={loading}
            minHeight={260}
            striped
            highlightOnHover
            noRecordsText="Nenhuma parcela encontrada para os filtros selecionados."
            columns={[
              {
                accessor: 'casamento_nome',
                title: 'Casamento',
                render: (record) => (
                  <Stack gap={2}>
                    <Text fw={600}>{record.casamento_nome}</Text>
                    <Text size="xs" c="dimmed">{record.casamento_data ? new Date(`${record.casamento_data}T00:00:00`).toLocaleDateString('pt-BR') : '-'}</Text>
                  </Stack>
                ),
              },
              {
                accessor: 'fornecedor_nome',
                title: 'Fornecedor • Parcela',
                render: (record) => (
                  <Stack gap={2}>
                    <Text fw={600}>{record.fornecedor_nome}</Text>
                    <Text size="sm" c="dimmed">{record.descricao}</Text>
                  </Stack>
                ),
              },
              {
                accessor: 'data_vencimento',
                title: 'Vencimento',
                render: (record) => (
                  <Text c={record.status_calculado === 'em_atraso' ? 'red' : dueColor(record)} fw={600}>
                    {new Date(`${record.data_vencimento}T00:00:00`).toLocaleDateString('pt-BR')}
                  </Text>
                ),
              },
              {
                accessor: 'valor',
                title: 'Valor',
                render: (record) => <Text fw={600}>{formatCurrency(record.valor)}</Text>,
              },
              {
                accessor: 'forma_pagamento',
                title: 'Forma',
                render: (record) => <Text>{FORMA_OPTIONS.find((item) => item.value === record.forma_pagamento)?.label || record.forma_pagamento}</Text>,
              },
              {
                accessor: 'status',
                title: 'Status',
                render: (record) => <Badge color={statusColor(record.status_calculado || record.status)}>{statusLabel(record.status_calculado || record.status)}</Badge>,
              },
              {
                accessor: 'actions',
                title: 'Ações',
                render: (record) => (
                  <Group gap="xs" wrap="nowrap">
                    {record.status === 'pago' ? (
                      <Button variant="light" color="orange" size="xs" onClick={() => handleRevert(record)} leftSection={<IconArrowRight size={14} />}>
                        Reverter
                      </Button>
                    ) : (
                      <Button variant="light" color="green" size="xs" onClick={() => openPaymentModal(record)} leftSection={<IconCreditCard size={14} />}>
                        Pagar
                      </Button>
                    )}
                    <ActionIcon variant="light" size="lg" onClick={() => record.fornecedor ? openManager(record.fornecedor) : undefined} aria-label="Abrir gerenciador" disabled={!record.fornecedor}>
                      <IconArrowRight size={16} />
                    </ActionIcon>
                  </Group>
                ),
              },
            ]}
          />
        </Card>
      </Stack>

      <Modal opened={managerOpen} onClose={() => setManagerOpen(false)} title="Visualizar/Gerenciar Plano Existente" centered size="xl">
        <Stack gap="md">
          {managerLoading ? (
            <Text c="dimmed">Carregando plano...</Text>
          ) : managerSupplier ? (
            <>
              <Group grow>
                <Card radius="lg" withBorder>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">Valor acordado</Text>
                  <Title order={4}>{formatCurrency(managerSupplier.valor_combinado)}</Title>
                </Card>
                <Card radius="lg" withBorder>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">Valor pago</Text>
                  <Title order={4}>{formatCurrency(managerSupplier.valor_pago)}</Title>
                </Card>
                <Card radius="lg" withBorder>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">Saldo devedor</Text>
                  <Title order={4}>{formatCurrency(managerSupplier.saldo_devedor)}</Title>
                </Card>
              </Group>

              <Group justify="space-between" align="center">
                <Badge color={managerSupplier.status_financeiro === 'Quitado' ? 'green' : managerSupplier.status_financeiro === 'Em atraso' ? 'red' : 'yellow'}>
                  {managerSupplier.status_financeiro || 'Sem plano'}
                </Badge>
                {!managerParcelas.length ? (
                  <Group>
                    <Button variant="default" styles={softButtonStyles} onClick={() => setCreatePlanOpen(true)} leftSection={<IconPlus size={16} />}>
                      Criar plano
                    </Button>
                    <Button styles={primaryButtonStyles} onClick={() => setManualOpen(true)} leftSection={<IconPlus size={16} />}>
                      Adicionar manualmente
                    </Button>
                  </Group>
                ) : null}
              </Group>

              {!managerParcelas.length ? (
                <Card radius="lg" withBorder>
                  <Stack gap="xs">
                    <Text fw={700}>Sem plano de pagamento definido.</Text>
                    <Text c="dimmed">Crie um cronograma com entrada e parcelas para acompanhar saldo devedor e vencimentos.</Text>
                  </Stack>
                </Card>
              ) : null}

              <ScrollArea type="auto" style={{ maxHeight: 420 }}>
                <Table withTableBorder withColumnBorders highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Descrição</Table.Th>
                      <Table.Th>Vencimento</Table.Th>
                      <Table.Th>Valor</Table.Th>
                      <Table.Th>Forma</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Ações</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {managerParcelas.map((parcela) => {
                      const parcelaStatus = parcela.status_calculado || parcela.status || 'a_vencer';
                      return (
                        <Table.Tr key={parcela.id}>
                          <Table.Td>{parcela.descricao}</Table.Td>
                          <Table.Td>
                            <Text c={parcelaStatus === 'em_atraso' ? 'red' : dueColor(parcela)} fw={600}>
                              {new Date(`${parcela.data_vencimento}T00:00:00`).toLocaleDateString('pt-BR')}
                            </Text>
                          </Table.Td>
                          <Table.Td>{formatCurrency(parcela.valor)}</Table.Td>
                          <Table.Td>{FORMA_OPTIONS.find((item) => item.value === parcela.forma_pagamento)?.label || parcela.forma_pagamento}</Table.Td>
                          <Table.Td><Badge color={statusColor(parcelaStatus)}>{statusLabel(parcelaStatus)}</Badge></Table.Td>
                          <Table.Td>
                            <Group gap="xs" wrap="nowrap">
                              {parcelaStatus === 'pago' ? (
                                <Button variant="light" color="orange" size="xs" onClick={() => handleRevert(parcela)}>
                                  Reverter
                                </Button>
                              ) : (
                                <Button variant="light" color="green" size="xs" onClick={() => openPaymentModal(parcela)}>
                                  Pagar
                                </Button>
                              )}
                              <Button variant="light" size="xs" onClick={() => openEditModal(parcela)} disabled={parcelaStatus === 'pago'}>
                                Editar
                              </Button>
                              <Button variant="light" color="red" size="xs" onClick={() => handleDelete(parcela)} disabled={parcelaStatus === 'pago'}>
                                Excluir
                              </Button>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </>
          ) : null}
        </Stack>
      </Modal>

      <Modal opened={createPlanOpen} onClose={() => setCreatePlanOpen(false)} title="Criar Plano de Pagamento" centered size="xl">
        <Stack gap="md">
          <Group grow>
            <TextInput label="Entrada (%)" value={planForm.entrada_percentual} onChange={(event) => setPlanForm((current) => ({ ...current, entrada_percentual: event.currentTarget.value }))} styles={inputStyles} />
            <TextInput label="Nº de parcelas" value={planForm.quantidade_parcelas} onChange={(event) => setPlanForm((current) => ({ ...current, quantidade_parcelas: event.currentTarget.value }))} styles={inputStyles} />
            <Select label="Intervalo" data={WINDOW_OPTIONS} value={planForm.intervalo_dias as WindowFilter} onChange={(value) => setPlanForm((current) => ({ ...current, intervalo_dias: value || '30' }))} styles={inputStyles} />
          </Group>
          <Group grow>
            <TextInput label="1ª parcela" type="date" value={planForm.data_primeira_parcela} onChange={(event) => setPlanForm((current) => ({ ...current, data_primeira_parcela: event.currentTarget.value }))} styles={inputStyles} />
            <Select label="Forma padrão" data={FORMA_OPTIONS} value={planForm.forma_pagamento} onChange={(value) => setPlanForm((current) => ({ ...current, forma_pagamento: (value as FormaPagamento) || 'pix' }))} styles={inputStyles} />
          </Group>
          <Button onClick={() => void handleGeneratePreview()} loading={previewLoading} leftSection={<IconCheck size={16} />}>
            Gerar prévia das parcelas
          </Button>

          {planPreview.length ? (
            <Stack gap="sm">
              <ScrollArea type="auto" style={{ maxHeight: 360 }}>
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
                        <Table.Td><TextInput value={row.descricao} onChange={(event) => setPlanPreview((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, descricao: event.currentTarget.value } : item))} styles={inputStyles} /></Table.Td>
                        <Table.Td><TextInput type="date" value={row.data_vencimento} onChange={(event) => setPlanPreview((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, data_vencimento: event.currentTarget.value } : item))} styles={inputStyles} /></Table.Td>
                        <Table.Td><TextInput value={row.valor} onChange={(event) => setPlanPreview((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, valor: event.currentTarget.value } : item))} styles={inputStyles} /></Table.Td>
                        <Table.Td>
                          <Select data={FORMA_OPTIONS} value={row.forma_pagamento} onChange={(value) => setPlanPreview((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, forma_pagamento: (value as FormaPagamento) || 'pix' } : item))} styles={inputStyles} />
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon variant="light" color="red" aria-label="Excluir linha" onClick={() => setPlanPreview((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
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
                <Badge color={planMatches ? 'green' : 'red'}>{planMatches ? 'Bate com o valor acordado' : 'Soma divergente'}</Badge>
              </Group>
              <Group justify="flex-end">
                <Button variant="default" styles={softButtonStyles} onClick={() => setCreatePlanOpen(false)}>Cancelar</Button>
                <Button styles={primaryButtonStyles} disabled={!planMatches} loading={planSaving} onClick={() => void handleSavePlan()}>Salvar plano</Button>
              </Group>
            </Stack>
          ) : null}
        </Stack>
      </Modal>

      <Modal opened={manualOpen} onClose={() => setManualOpen(false)} title="Adicionar Manualmente" centered>
        <Stack gap="md">
          <TextInput label="Número da parcela" value={String(manualForm.numero_parcela)} onChange={(event) => setManualForm((current) => ({ ...current, numero_parcela: Number(event.currentTarget.value) }))} styles={inputStyles} />
          <TextInput label="Descrição" value={manualForm.descricao} onChange={(event) => setManualForm((current) => ({ ...current, descricao: event.currentTarget.value }))} styles={inputStyles} />
          <Group grow>
            <TextInput label="Valor" value={manualForm.valor} onChange={(event) => setManualForm((current) => ({ ...current, valor: event.currentTarget.value }))} styles={inputStyles} />
            <TextInput label="Vencimento" type="date" value={manualForm.data_vencimento} onChange={(event) => setManualForm((current) => ({ ...current, data_vencimento: event.currentTarget.value }))} styles={inputStyles} />
          </Group>
          <Group grow>
            <Select label="Forma" data={FORMA_OPTIONS} value={manualForm.forma_pagamento} onChange={(value) => setManualForm((current) => ({ ...current, forma_pagamento: (value as FormaPagamento) || 'pix' }))} styles={inputStyles} />
            <Select label="Status" data={[{ value: 'a_vencer', label: 'A vencer' }, { value: 'em_atraso', label: 'Em atraso' }, { value: 'pago', label: 'Pago' }]} value={manualForm.status || 'a_vencer'} onChange={(value) => setManualForm((current) => ({ ...current, status: (value as ParcelaStatus) || 'a_vencer' }))} styles={inputStyles} />
          </Group>
          <TextInput label="Observação" value={manualForm.observacao || ''} onChange={(event) => setManualForm((current) => ({ ...current, observacao: event.currentTarget.value }))} styles={inputStyles} placeholder="Detalhes como desconto, multa ou conta utilizada" />
          <Group justify="flex-end">
            <Button variant="default" styles={softButtonStyles} onClick={() => setManualOpen(false)}>Cancelar</Button>
            <Button styles={primaryButtonStyles} onClick={() => void handleCreateManual()}>Adicionar linha</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={editingRowOpen} onClose={() => setEditingRowOpen(false)} title="Editar parcela" centered>
        <Stack gap="md">
          <TextInput label="Número da parcela" value={String(manualForm.numero_parcela)} onChange={(event) => setManualForm((current) => ({ ...current, numero_parcela: Number(event.currentTarget.value) }))} styles={inputStyles} />
          <TextInput label="Descrição" value={manualForm.descricao} onChange={(event) => setManualForm((current) => ({ ...current, descricao: event.currentTarget.value }))} styles={inputStyles} />
          <Group grow>
            <TextInput label="Valor" value={manualForm.valor} onChange={(event) => setManualForm((current) => ({ ...current, valor: event.currentTarget.value }))} styles={inputStyles} />
            <TextInput label="Vencimento" type="date" value={manualForm.data_vencimento} onChange={(event) => setManualForm((current) => ({ ...current, data_vencimento: event.currentTarget.value }))} styles={inputStyles} />
          </Group>
          <Group grow>
            <Select label="Forma" data={FORMA_OPTIONS} value={manualForm.forma_pagamento} onChange={(value) => setManualForm((current) => ({ ...current, forma_pagamento: (value as FormaPagamento) || 'pix' }))} styles={inputStyles} />
            <Select label="Status" data={[{ value: 'a_vencer', label: 'A vencer' }, { value: 'em_atraso', label: 'Em atraso' }, { value: 'pago', label: 'Pago' }]} value={manualForm.status || 'a_vencer'} onChange={(value) => setManualForm((current) => ({ ...current, status: (value as ParcelaStatus) || 'a_vencer' }))} styles={inputStyles} />
          </Group>
          <TextInput label="Observação" value={manualForm.observacao || ''} onChange={(event) => setManualForm((current) => ({ ...current, observacao: event.currentTarget.value }))} styles={inputStyles} />
          <Group justify="flex-end">
            <Button variant="default" styles={softButtonStyles} onClick={() => setEditingRowOpen(false)}>Cancelar</Button>
            <Button styles={primaryButtonStyles} onClick={() => void handleUpdateManual()}>Salvar alterações</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={paymentOpen} onClose={() => setPaymentOpen(false)} title="Registrar Pagamento" centered>
        <Stack gap="md">
          <Card radius="lg" withBorder>
            <Text fw={700}>{activeParcela?.descricao || 'Parcela'}</Text>
            <Text size="sm" c="dimmed">Previsto: {formatCurrency(activeParcela?.valor)} via {FORMA_OPTIONS.find((item) => item.value === activeParcela?.forma_pagamento)?.label || '-'}</Text>
          </Card>
          <Group grow>
            <TextInput label="Data do pagamento" type="date" value={paymentForm.data_pagamento} onChange={(event) => setPaymentForm((current) => ({ ...current, data_pagamento: event.currentTarget.value }))} styles={inputStyles} />
            <TextInput label="Valor pago" value={paymentForm.valor} onChange={(event) => setPaymentForm((current) => ({ ...current, valor: event.currentTarget.value }))} styles={inputStyles} />
          </Group>
          <TextInput label="Observação" value={paymentForm.observacao} onChange={(event) => setPaymentForm((current) => ({ ...current, observacao: event.currentTarget.value }))} styles={inputStyles} placeholder="Desconto, multa ou conta utilizada" />
          <Group justify="flex-end">
            <Button variant="default" styles={softButtonStyles} onClick={() => setPaymentOpen(false)}>Cancelar</Button>
            <Button styles={primaryButtonStyles} onClick={() => void handlePay()}>Registrar pagamento</Button>
          </Group>
        </Stack>
      </Modal>
    </BaseLayout>
  );
}