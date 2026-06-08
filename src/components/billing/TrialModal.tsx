import {
  Button,
  Group,
  List,
  Modal,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconCheck, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";

type TrialModalProps = {
  opened: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  trialEndsAt?: string | null;
};

export function TrialModal({
  opened,
  onClose,
  onUpgrade,
  trialEndsAt,
}: TrialModalProps) {
  const trialEndLabel = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "em 7 dias";

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      fullScreen={isMobile}
      size="md"
      title={null}
      overlayProps={{ opacity: 0.35, blur: 4 }}
      styles={{
        content: {
          background: "var(--marriplan-surface)",
          border: "1px solid var(--marriplan-border)",
          boxShadow: "var(--marriplan-shadow)",
        },
        header: {
          background: "var(--marriplan-surface)",
        },
      }}
    >
      <Stack gap="md" p="xs" justify="space-between">
        <Text
          size="xs"
          tt="uppercase"
          fw={700}
          style={{ letterSpacing: 2, color: "var(--marriplan-rose)" }}
        >
          Trial ativado
        </Text>
        <Title order={3} c="var(--marriplan-text)">
          Você terá 7 dias de Trial Premium para testar tudo sem bloqueios.
        </Title>
        <Text size="sm" c="var(--marriplan-muted)" style={{ lineHeight: 1.7 }}>
          Durante o Trial, você continua organizando normalmente com acesso ao
          pacote Premium. O período termina {trialEndLabel}.
        </Text>

        <List
          spacing="xs"
          size="sm"
          icon={
            <ThemeIcon
              radius="xl"
              size={18}
              variant="light"
              style={{
                background: "rgba(181, 139, 122, 0.16)",
                color: "var(--marriplan-rose)",
              }}
            >
              <IconCheck size={12} />
            </ThemeIcon>
          }
        >
          <List.Item>
            Convidados, checklist, presentes e fornecedores sem travar o fluxo.
          </List.Item>
          <List.Item>
            Exportações e IA liberadas enquanto o Trial estiver ativo.
          </List.Item>
          <List.Item>
            Ao final do período, você pode fazer upgrade sem perder seu
            progresso.
          </List.Item>
        </List>

        <Group justify="flex-end" gap="sm">
          <Button
            variant="light"
            onClick={onClose}
            style={{
              background: "var(--marriplan-champagne)",
              color: "var(--marriplan-text)",
            }}
          >
            Continuar Trial
          </Button>
          <Button
            component={Link}
            href="/checkout"
            onClick={onUpgrade}
            leftSection={<IconSparkles size={16} />}
            style={{ background: "var(--marriplan-rose)", color: "#fff" }}
          >
            Fazer upgrade
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
