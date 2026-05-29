import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import Link from "next/link";

type FreePlanLimitBannerProps = {
  featureLabel: string;
  limit: number;
  currentUsage: number;
  title?: string;
  description?: string;
  buttonLabel?: string;
  href?: string;
};

export function FreePlanLimitBanner({
  featureLabel,
  limit,
  currentUsage,
  title = "Você atingiu o limite do plano gratuito",
  description,
  buttonLabel = "Fazer upgrade",
  href = "/checkout",
}: FreePlanLimitBannerProps) {
  const bannerDescription =
    description ||
    `O plano Free permite até ${limit} ${featureLabel.toLowerCase()}. Você já tem ${currentUsage}. Atualize para liberar novos cadastros sem limite.`;

  return (
    <Card
      radius="xl"
      withBorder
      p="lg"
      className="marriplan-card"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 248, 242, 0.98) 0%, rgba(247, 236, 226, 0.98) 100%)",
        borderColor: "rgba(181, 139, 122, 0.22)",
        boxShadow: "0 16px 34px rgba(70, 56, 43, 0.08)",
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap">
        <Stack gap={6} style={{ maxWidth: 700 }}>
          <Text
            size="xs"
            tt="uppercase"
            fw={700}
            c="var(--marriplan-rose)"
            style={{ letterSpacing: 2 }}
          >
            Limite do Free
          </Text>
          <Title order={3} c="var(--marriplan-text)">
            {title}
          </Title>
          <Text size="sm" c="var(--marriplan-muted)" style={{ lineHeight: 1.7 }}>
            {bannerDescription}
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