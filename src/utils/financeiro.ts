import { FormaPagamento, ParcelaStatus } from "@/services/financeiro";

export const STATUS_LABELS: Record<string, string> = {
  available: "Disponível",
  purchased: "Comprado",
  reserved: "Reservado",
};

export function formatCurrency(value: number | string) {
  if (typeof value === "string") value = parseFloat(value);
  return value
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "R$ 0,00";
}

export function getStatusBadgeStyleFin(status: string) {
  if (status === "a_vencer") {
    return {
      backgroundColor: "var(--marriplan-rose)",
      color: "#fff",
    };
  }

  if (status === "pago") {
    return {
      backgroundColor: "rgba(242, 230, 216, 0.95)",
      color: "var(--marriplan-text)",
    };
  }

  return {
    backgroundColor: "var(--marriplan-border)",
    color: "var(--marriplan-text)",
  };
}

export function statusLabel(status?: ParcelaStatus) {
  if (status === "pago") return "Pago";
  if (status === "em_atraso") return "Em atraso";
  return "A vencer";
}

export function statusColor(status?: ParcelaStatus) {
  if (status === "pago") return "green";
  if (status === "em_atraso") return "red";
  return "yellow";
}

export type SupplierParcelRow = {
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

export function dueColor(
  parcela: Pick<
    SupplierParcelRow,
    "status" | "status_calculado" | "data_vencimento"
  >,
) {
  const calculated = parcela.status_calculado || parcela.status;
  if (calculated === "pago") return "green";
  if (calculated === "em_atraso") return "red";
  const dueDate = new Date(`${parcela.data_vencimento}T00:00:00`);
  const diffDays = Math.ceil(
    (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 7) return "yellow";
  return "teal";
}

export function translateEventLevel(level: string) {
  switch (level) {
    case "economy":
      return "Econômico";
    case "intermediate":
      return "Intermediário";
    case "standard":
      return "Padrão";
    case "premium":
      return "Premium";
    case "luxury":
      return "Luxo";
    default:
      return level;
  }
}
