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

export function getStatusBadgeStyle(status: string) {
  if (status === "available") {
    return {
      backgroundColor: "var(--marriplan-rose)",
      color: "#fff",
    };
  }

  if (status === "reserved") {
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
