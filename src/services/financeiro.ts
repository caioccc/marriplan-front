import api from './api';

export type FormaPagamento =
  | 'pix'
  | 'boleto'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'transferencia'
  | 'dinheiro'
  | 'cheque'
  | 'outro';

export type ParcelaStatus = 'a_vencer' | 'em_atraso' | 'pago';

export type WeddingSupplierFinanceSummary = {
  id: number;
  supplier_detail?: {
    id: number;
    name: string;
    company_name?: string;
    category_detail?: { id: number; name: string; slug: string };
  };
  wedding_profile?: {
    id: number;
    nome_noivo?: string;
    nome_noiva?: string;
    data_casamento?: string | null;
    local?: string;
    user?: { id: number; username: string };
  };
  valor_combinado?: string | number | null;
  valor_pago?: string | number | null;
  saldo_devedor?: string | number | null;
  status_financeiro?: 'Sem plano' | 'A vencer' | 'Em atraso' | 'Quitado';
  proxima_parcela?: ParcelaPagamento | null;
};

export type ParcelaPagamento = {
  id: number;
  fornecedor?: number;
  fornecedor_resumo?: WeddingSupplierFinanceSummary;
  numero_parcela: number;
  descricao: string;
  valor: string | number;
  data_vencimento: string;
  data_pagamento?: string | null;
  forma_pagamento: FormaPagamento;
  status: ParcelaStatus;
  status_calculado?: ParcelaStatus;
  is_overdue?: boolean;
  observacao?: string | null;
  casamento_nome?: string;
  casamento_data?: string | null;
  fornecedor_nome?: string;
  can_edit?: boolean;
  can_remove?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FinanceSummary = {
  upcoming_7_days: { count: number; total: string | number };
  overdue: { count: number; total: string | number };
  selected: { count: number; total: string | number };
};

export type FinanceListResponse = {
  results: ParcelaPagamento[];
  count: number;
  summary: FinanceSummary;
};

export type PlanoPagamentoPreviewPayload = {
  fornecedor_id: number;
  entrada_percentual: number;
  quantidade_parcelas: number;
  intervalo_dias: number;
  data_primeira_parcela: string;
  forma_pagamento: FormaPagamento;
};

export type PlanoPagamentoParcelaInput = {
  numero_parcela: number;
  descricao: string;
  valor: string | number;
  data_vencimento: string;
  forma_pagamento: FormaPagamento;
  status?: ParcelaStatus;
  observacao?: string;
};

export type PlanoPagamentoSalvarPayload = {
  fornecedor_id: number;
  parcelas: PlanoPagamentoParcelaInput[];
};

export type RegistrarPagamentoPayload = {
  data_pagamento?: string;
  valor?: string | number;
  observacao?: string;
  forma_pagamento?: FormaPagamento;
};

export async function listParcelasPagamento(params: Record<string, string | number> = {}) {
  const { data } = await api.get('/api/parcelas-pagamento/', { params });
  return data as FinanceListResponse;
}

export async function getParcelaPagamento(id: number) {
  const { data } = await api.get(`/api/parcelas-pagamento/${id}/`);
  return data as ParcelaPagamento;
}

export async function criarParcelaPagamento(payload: Omit<ParcelaPagamento, 'id' | 'fornecedor_resumo' | 'created_at' | 'updated_at' | 'status_calculado' | 'is_overdue'>) {
  const { data } = await api.post('/api/parcelas-pagamento/', payload);
  return data as ParcelaPagamento;
}

export async function gerarPreviaPlano(payload: PlanoPagamentoPreviewPayload) {
  const { data } = await api.post('/api/parcelas-pagamento/previsao-plano/', payload);
  return data as {
    fornecedor: WeddingSupplierFinanceSummary;
    valor_combinado: string | number | null;
    total_parcelas: string | number;
    validacao_ok: boolean;
    parcelas: PlanoPagamentoParcelaInput[];
    resumo_fornecedor: WeddingSupplierFinanceSummary;
  };
}

export async function salvarPlanoPagamento(payload: PlanoPagamentoSalvarPayload) {
  const { data } = await api.post('/api/parcelas-pagamento/salvar-plano/', payload);
  return data as {
    resumo_fornecedor: WeddingSupplierFinanceSummary;
    parcelas: ParcelaPagamento[];
  };
}

export async function registrarPagamento(id: number, payload: RegistrarPagamentoPayload) {
  const { data } = await api.post(`/api/parcelas-pagamento/${id}/pagar/`, payload);
  return data as ParcelaPagamento;
}

export async function reverterPagamento(id: number) {
  const { data } = await api.post(`/api/parcelas-pagamento/${id}/reverter-pagamento/`);
  return data as ParcelaPagamento;
}

export async function atualizarParcelaPagamento(id: number, payload: Partial<PlanoPagamentoParcelaInput>) {
  const { data } = await api.patch(`/api/parcelas-pagamento/${id}/`, payload);
  return data as ParcelaPagamento;
}

export async function removerParcelaPagamento(id: number) {
  await api.delete(`/api/parcelas-pagamento/${id}/`);
}