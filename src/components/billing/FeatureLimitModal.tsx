import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import Link from "next/link";

type FeatureLimitModalProps = {
  opened: boolean;
  onClose: () => void;
  featureLabel: string;
  limit?: number | boolean | null;
  currentUsage: number;
};

export function FeatureLimitModal({
  opened,
  onClose,
  featureLabel,
  limit,
  currentUsage,
}: FeatureLimitModalProps) {
  const limitLabel =
    typeof limit === "number" ? `${limit}` : "ilimitado";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      title={null}
      size="md"
      overlayProps={{ opacity: 0.35, blur: 4 }}
      styles={{
        content: {
          background: "var(--marriplan-surface)",
          border: "1px solid var(--marriplan-border)",
          boxShadow: "var(--marriplan-shadow)",
        },
      }}
    >
      <Stack gap="md" p="xs">
        <Text size="xs" tt="uppercase" fw={700} style={{ letterSpacing: 2, color: "var(--marriplan-rose)" }}>
          Limite do Free
        </Text>
        <Title order={3} c="var(--marriplan-text)">
          Você atingiu o limite do plano gratuito.
        </Title>
        <Text size="sm" c="var(--marriplan-muted)" style={{ lineHeight: 1.7 }}>
          {`O recurso ${featureLabel.toLowerCase()} permite até ${limitLabel} no plano Free. Você já está com ${currentUsage} de ${limitLabel}. Continue organizando com Premium para liberar tudo sem travas.`}
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={onClose} style={{ background: "var(--marriplan-champagne)", color: "var(--marriplan-text)" }}>
            Continuar organizando
          </Button>
          <Button
            component={Link}
            href="/checkout"
            leftSection={<IconSparkles size={16} />}
            style={{ background: "var(--marriplan-rose)", color: "#fff" }}
          >
            Assinar Premium
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
