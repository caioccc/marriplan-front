import { Badge, type BadgeProps } from "@mantine/core";
import type { CSSProperties } from "react";

type StatusTone = "neutral" | "rose" | "gold" | "muted";

type StatusBadgeKind = "checklist" | "guest" | "gift";

type StatusBadgeConfig = {
  label: string;
  tone: StatusTone;
};

type StatusBadgeMap = Record<string, StatusBadgeConfig>;

const toneStyles: Record<StatusTone, CSSProperties> = {
  neutral: {
    backgroundColor: "var(--marriplan-surface-muted)",
    color: "var(--marriplan-text)",
    border: "1px solid var(--marriplan-border)",
  },
  rose: {
    backgroundColor: "rgba(181, 139, 122, 0.16)",
    color: "var(--marriplan-rose)",
    border: "1px solid rgba(181, 139, 122, 0.28)",
  },
  gold: {
    backgroundColor: "rgba(200, 176, 138, 0.18)",
    color: "var(--marriplan-gold)",
    border: "1px solid rgba(200, 176, 138, 0.3)",
  },
  muted: {
    backgroundColor: "rgba(234, 223, 211, 0.66)",
    color: "var(--marriplan-muted)",
    border: "1px solid var(--marriplan-border)",
  },
};

// Mapeamento semântico: status similares compartilham cores da paleta
// Neutral: não iniciado ou disponível (pending tasks, available gifts)
// Gold: em progresso ou intermediário (in_progress tasks, pending guests, reserved gifts)
// Rose: concluído, confirmado ou comprado (done tasks, confirmed guests, purchased gifts)
// Muted: recusado ou negativo (declined guests)
const statusMaps: Record<StatusBadgeKind, StatusBadgeMap> = {
  checklist: {
    pending: { label: "Pendente", tone: "neutral" }, // não iniciado
    in_progress: { label: "Em andamento", tone: "gold" }, // em progresso
    done: { label: "Concluído", tone: "rose" }, // concluído
  },
  guest: {
    pending: { label: "Pendente", tone: "neutral" }, // aguardando resposta (em progresso)
    confirmed: { label: "Confirmado", tone: "rose" }, // concluído/confirmado
    declined: { label: "Recusado", tone: "muted" }, // recusado
  },
  gift: {
    available: { label: "Disponível", tone: "neutral" }, // não iniciado
    reserved: { label: "Reservado", tone: "gold" }, // em progresso (reservado mas não comprado)
    purchased: { label: "Comprado", tone: "rose" }, // concluído
  },
};

export function getStatusBadgeConfig(kind: StatusBadgeKind, status: string) {
  return (
    statusMaps[kind][status] ?? { label: status, tone: "neutral" as const }
  );
}

type MarriplanStatusBadgeProps = Omit<BadgeProps, "children" | "color"> & {
  kind: StatusBadgeKind;
  status: string;
};

export function MarriplanStatusBadge({
  kind,
  status,
  style,
  size = "sm",
  ...props
}: MarriplanStatusBadgeProps) {
  const config = getStatusBadgeConfig(kind, status);

  return (
    <Badge
      {...props}
      color="gray"
      size={size}
      variant="light"
      style={{
        textTransform: "none",
        fontWeight: 600,
        letterSpacing: "0.01em",
        ...toneStyles[config.tone],
        ...style,
      }}
    >
      {config.label}
    </Badge>
  );
}
