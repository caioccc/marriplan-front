import { Card, Group, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

type PageSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  filters?: ReactNode;
};

export default function PageSectionHeader({
  eyebrow,
  title,
  description,
  actions,
  filters,
}: PageSectionHeaderProps) {
  return (
    <Stack gap="md">
      <Card
        radius="xl"
        p="xl"
        withBorder
        style={{
          background: "linear-gradient(135deg, #fffdf9 0%, #f6eee4 100%)",
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Stack gap={4} style={{ maxWidth: 680 }}>
            <Text
              size="xs"
              tt="uppercase"
              fw={700}
              c="dimmed"
              style={{ letterSpacing: 1.2 }}
            >
              {eyebrow}
            </Text>
            <Title order={2}>{title}</Title>
            <Text c="dimmed">{description}</Text>
          </Stack>
          {actions ? <Group gap="sm">{actions}</Group> : null}
        </Group>
      </Card>

      {filters ? (
        <Card
          radius="xl"
          p="md"
          withBorder
          style={{
            background: "var(--marriplan-surface)",
            border: "1px solid var(--marriplan-border)",
            padding: "12px 14px",
            borderRadius: 16,
          }}
        >
          {filters}
        </Card>
      ) : null}
    </Stack>
  );
}