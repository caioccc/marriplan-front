import { BillingPlanDefinition, FEATURE_LABELS } from "@/constants/plans";
import {
  Badge,
  Button,
  Card,
  Group,
  List,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

type PlanCardProps = {
  plan: BillingPlanDefinition;
  actionHref: string;
  actionLabel: string;
  active?: boolean;
  onActionClick?: () => void;
};

export function PlanCard({
  plan,
  actionHref,
  actionLabel,
  active = false,
  onActionClick,
}: PlanCardProps) {
  return (
    <Card
      radius="xl"
      p="xl"
      withBorder
      className="marriplan-card"
      style={{
        position: "relative",
        overflow: "hidden",
        borderColor: plan.highlight
          ? "rgba(181, 139, 122, 0.24)"
          : "var(--marriplan-border)",
        background: plan.highlight
          ? "linear-gradient(180deg, #fffaf6 0%, #f6efe7 100%)"
          : "var(--marriplan-surface)",
        boxShadow: plan.highlight
          ? "0 20px 48px rgba(70, 56, 43, 0.1)"
          : "var(--marriplan-shadow)",
      }}
    >
      {plan.highlight && (
        <Badge
          style={{
            position: "absolute",
            right: 18,
            top: 18,
            background: "var(--marriplan-rose)",
            color: "#fff",
            border: "1px solid rgba(181, 139, 122, 0.2)",
          }}
        >
          Mais escolhido
        </Badge>
      )}

      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              style={{ letterSpacing: 2, color: "var(--marriplan-muted)" }}
            >
              {plan.name}
            </Text>
            <Title order={3} style={{ marginTop: 8, color: "var(--marriplan-text)" }}>
              {plan.price === 0 ? "R$ 0" : `R$ ${plan.price.toFixed(2).replace(".", ",")}`}
              <Text span size="sm" c="dimmed" fw={500}>
                {` ${plan.recurringLabel}`}
              </Text>
            </Title>
          </div>
          {active && (
            <Badge variant="light" color="green">
              Plano atual
            </Badge>
          )}
        </Group>

        <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>
          {plan.description}
        </Text>

        <List spacing="xs" size="sm" icon={<IconCheck size={14} />}>
          {Object.entries(plan.features)
            .filter(([feature]) => feature !== "ai")
            .map(([feature, value]) => (
            <List.Item key={feature}>
              {feature === "exports" || feature === "ai"
                ? value
                  ? `${FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS]} liberado`
                  : `${FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS]} indisponível`
                : value === null
                  ? `${FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS]} ilimitado`
                  : `${value} ${feature === "checklist" ? "tarefas" : FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS].toLowerCase()}`}
            </List.Item>
          ))}
        </List>

        <Button
          component="a"
          href={actionHref}
          onClick={onActionClick}
          radius="xl"
          size="md"
          fullWidth
          variant="light"
          style={{
            background: plan.highlight
              ? "var(--marriplan-rose)"
              : "var(--marriplan-champagne)",
            color: plan.highlight ? "#fff" : "var(--marriplan-text)",
            border: "1px solid var(--marriplan-border)",
          }}
        >
          {actionLabel}
        </Button>
      </Stack>
    </Card>
  );
}
