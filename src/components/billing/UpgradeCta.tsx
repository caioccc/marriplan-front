import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import Link from "next/link";
import { FREE_PLAN_TEXT } from "@/constants/plans";

type UpgradeCtaProps = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  href?: string;
};

export function UpgradeCta({
  title = "Seu casamento merece mais organização ✨",
  description = `Com o Premium, você libera tudo sem limites.`,
  buttonLabel = "Assinar Premium",
  href = "/checkout",
}: UpgradeCtaProps) {
  return (
    <Card
      radius="xl"
      p="xl"
      withBorder
      className="marriplan-card"
      style={{
        background:
          "linear-gradient(135deg, #fffaf6 0%, #f6efe7 56%, #efe4d8 100%)",
        borderColor: "rgba(181, 139, 122, 0.22)",
        boxShadow: "0 18px 40px rgba(70, 56, 43, 0.08)",
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap">
        <Stack gap={6} style={{ maxWidth: 620 }}>
          <Text
            c="var(--marriplan-rose)"
            tt="uppercase"
            fw={700}
            size="xs"
            style={{ letterSpacing: 2 }}
          >
            Upgrade premium
          </Text>
          <Title order={3} c="var(--marriplan-text)">
            {title}
          </Title>
          <Text c="var(--marriplan-muted)" size="sm" style={{ lineHeight: 1.7 }}>
            {description}
          </Text>
        </Stack>

        <Button
          component={Link}
          href={href}
          size="md"
          radius="xl"
          leftSection={<IconSparkles size={18} />}
          style={{
            background: "var(--marriplan-rose)",
            color: "#fff",
            border: "1px solid rgba(181, 139, 122, 0.2)",
          }}
        >
          {buttonLabel}
        </Button>
      </Group>
    </Card>
  );
}
