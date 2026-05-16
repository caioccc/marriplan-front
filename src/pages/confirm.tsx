import { guests_partial_update, guests_read } from "@/services/guests";
import { primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Guest {
  id: number;
  name: string;
  status_presenca?: "Pending" | "Confirmed" | "Refused";
}

export default function ConfirmPage() {
  const router = useRouter();
  const { guest_id } = router.query;

  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "Confirmed" | "Refused" | null
  >(null);

  useEffect(() => {
    if (!guest_id) return;

    async function loadGuest() {
      try {
        setLoading(true);
        setError(null);
        const data = await guests_read(Number(guest_id));
        setGuest(data);
      } catch (err: any) {
        console.error("Erro ao carregar convidado:", err);
        setError(
          "Convidado não encontrado. O link pode estar expirado ou inválido.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadGuest();
  }, [guest_id]);

  const handleConfirm = async (status: "Confirmed" | "Refused") => {
    if (!guest) return;

    setSubmitting(true);
    setProcessing(false);
    try {
      await guests_partial_update(guest.id, { status_presenca: status });

      // Recarregar dados
      const updated = await guests_read(guest.id);
      setGuest(updated);

      notifications.show({
        title:
          status === "Confirmed" ? "Presença Confirmada!" : "Presença Recusada",
        message:
          status === "Confirmed"
            ? "Obrigado! Sua presença foi confirmada. Esperamos você! 🥂"
            : "Entendemos. Suas informações foram atualizadas.",
        color: status === "Confirmed" ? "green" : "gray",
        icon:
          status === "Confirmed" ? (
            <IconCheck size={18} />
          ) : (
            <IconX size={18} />
          ),
      });

      setShowConfirmModal(false);
      setSelectedStatus(null);
      // mostrar loader global enquanto redireciona
      setProcessing(true);
      setTimeout(() => {
        router.push("/guests/thank-you");
      }, 1200);
    } catch (err: any) {
      console.error("Erro ao atualizar presença:", err);
      notifications.show({
        title: "Erro",
        message: "Falha ao atualizar sua presença. Por favor, tente novamente.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: "100dvh" }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Carregando...</Text>
        </Stack>
      </Center>
    );
  }

  if (processing) {
    return (
      <Center style={{ height: "100dvh" }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Processando sua confirmação...</Text>
        </Stack>
      </Center>
    );
  }

  if (error || !guest) {
    return (
      <Container size="sm" py={60}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconX size={48} color="var(--marriplan-rose)" />
            <Title order={2} ta="center">
              Oops!
            </Title>
            <Text ta="center" c="dimmed">
              {error || "Convidado não encontrado."}
            </Text>
            <Button
              onClick={() => router.push("/")}
              styles={primaryButtonStyles}
            >
              Voltar ao Início
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  const statusColors: Record<string, string> = {
    Pending: "yellow",
    Confirmed: "green",
    Refused: "red",
  };

  const statusLabels: Record<string, string> = {
    Pending: "Pendente",
    Confirmed: "Confirmado",
    Refused: "Recusado",
  };

  return (
    <Container size="sm" py={60}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="lg">
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <Title order={1} mb="xs">
              Confirme Sua Presença
            </Title>
            <Text c="dimmed">Estamos felizes em tê-lo conosco! 💕</Text>
          </div>

          {/* Guest Info */}
          <Card
            shadow="xs"
            padding="md"
            radius="md"
            style={{ backgroundColor: "var(--marriplan-surface)" }}
          >
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={500}>Nome</Text>
                <Text>{guest.name}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500}>Status Atual</Text>
                <Badge
                  size="lg"
                  variant="light"
                  color={statusColors[guest.status_presenca || "Pending"]}
                >
                  {statusLabels[guest.status_presenca || "Pending"]}
                </Badge>
              </Group>
            </Stack>
          </Card>

          {/* Confirmation Form */}
          <Stack gap="md">
            <Text ta="center" c="dimmed" size="sm">
              Por favor, confirme sua presença no nosso casamento:
            </Text>

            <Group grow>
              <Button
                color="green"
                size="lg"
                leftSection={<IconCheck size={20} />}
                onClick={() => {
                  setSelectedStatus("Confirmed");
                  setShowConfirmModal(true);
                }}
                disabled={guest.status_presenca === "Confirmed"}
                loading={submitting && selectedStatus === "Confirmed"}
              >
                Confirmo minha Presença
              </Button>
              <Button
                color="red"
                size="lg"
                leftSection={<IconX size={20} />}
                onClick={() => {
                  setSelectedStatus("Refused");
                  setShowConfirmModal(true);
                }}
                disabled={guest.status_presenca === "Refused"}
                loading={submitting && selectedStatus === "Refused"}
              >
                Não Posso Ir
              </Button>
            </Group>
          </Stack>

          {/* Additional Info */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--marriplan-surface)",
              borderRadius: "8px",
              border: "1px solid var(--marriplan-border)",
            }}
          >
            <Text size="sm" c="dimmed">
              💡 Dica: Se você tiver alguma dúvida ou necessidade especial
              (alergias, acompanhantes, etc.), não hesite em entrar em contato
              conosco!
            </Text>
          </div>

          {/* Footer */}
          <Text ta="center" size="xs" c="dimmed">
            Obrigado por confirmar sua presença com a gente! 🎉
          </Text>
        </Stack>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        opened={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={
          selectedStatus === "Confirmed"
            ? "Confirmar Presença"
            : "Confirmar Recusa"
        }
        centered
        size="sm"
        overlayProps={{ blur: 2 }}
      >
        <Stack gap="md">
          <Text>
            {selectedStatus === "Confirmed"
              ? "Você tem certeza que quer confirmar sua presença?"
              : "Você tem certeza que não poderá comparecer?"}
          </Text>
          <Group grow>
            <Button
              variant="default"
              onClick={() => setShowConfirmModal(false)}
              styles={softButtonStyles}
              disabled={submitting}
            >
              Voltar
            </Button>
            <Button
              color={selectedStatus === "Confirmed" ? "green" : "red"}
              onClick={() => selectedStatus && handleConfirm(selectedStatus)}
              styles={primaryButtonStyles}
              loading={submitting}
            >
              {selectedStatus === "Confirmed"
                ? "Sim, Confirmar"
                : "Sim, Recusar"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
