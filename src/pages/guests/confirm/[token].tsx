import { guests_confirm_token, guests_confirm_verify } from "@/services/guests";
import { PALETTE, primaryButtonStyles, softButtonStyles } from "@/styles";
import {
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

interface GuestTokenInfo {
  guest_name: string;
  guest_id?: number;
}

export default function ConfirmByTokenPage() {
  const router = useRouter();
  const { token } = router.query;

  const [guestInfo, setGuestInfo] = useState<GuestTokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "Confirmed" | "Refused" | null
  >(null);

  useEffect(() => {
    if (!token) return;
    async function verify() {
      try {
        setLoading(true);
        setError(null);
        const data = await guests_confirm_verify(String(token));
        if (!data.valid) {
          setError("Link inválido ou expirado.");
          setGuestInfo(null);
        } else {
          setGuestInfo({
            guest_name: data.guest_name,
            guest_id: data.guest_id,
          });
        }
      } catch (err: any) {
        console.error(err);
        setError("Link inválido ou expirado.");
        setGuestInfo(null);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  const handleConfirm = async (status: "Confirmed" | "Refused") => {
    if (!token) return;
    setSubmitting(true);
    setProcessing(false);
    try {
      await guests_confirm_token(String(token), status);
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
      // mostra um loader global enquanto redireciona
      setProcessing(true);
      setTimeout(() => {
        router.push("/guests/thank-you");
      }, 1200);
    } catch (err: any) {
      console.error("Erro ao confirmar:", err);
      notifications.show({
        title: "Erro",
        message: "Falha ao atualizar sua presença. Tente novamente.",
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

  if (error || !guestInfo) {
    return (
      <Container size="lg" py="xl" h="100dvh">
        <Stack gap="xl">
          <Group justify="space-between" align="center" gap={4} mb={"xl"}>
            <Text
              fw={800}
              size="lg"
              c={PALETTE.ink}
              onClick={() => router.push("/")}
              style={{ letterSpacing: -0.5, cursor: "pointer" }}
            >
              Marriplan<span style={{ color: PALETTE.roseGold }}>.</span>
            </Text>
          </Group>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack align="center" gap="md">
              <IconX size={48} color="var(--marriplan-rose)" />
              <Title order={2} ta="center">
                Oops!
              </Title>
              <Text ta="center" c="dimmed">
                {error || "Link inválido."}
              </Text>
              <Button
                onClick={() => router.push("/")}
                styles={primaryButtonStyles}
              >
                Voltar ao Início
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py={60} h="100dvh">
      <Stack gap="xl">
        <Group justify="center" align="center" spacing={6}>
          <Text
            fw={800}
            size="lg"
            c={PALETTE.ink}
            onClick={() => router.push("/")}
            style={{ letterSpacing: -0.5, cursor: "pointer" }}
          >
            Marriplan<span style={{ color: PALETTE.roseGold }}>.</span>
          </Text>
        </Group>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="lg">
            <div style={{ textAlign: "center" }}>
              <Title order={1} mb="xs">
                Confirme Sua Presença
              </Title>
              <Text c="dimmed">Estamos felizes em tê-lo conosco! 💕</Text>
            </div>

            <Card
              shadow="xs"
              padding="md"
              radius="md"
              style={{ backgroundColor: "var(--marriplan-surface)" }}
            >
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={500}>Nome</Text>
                  <Text>{guestInfo.guest_name}</Text>
                </Group>
              </Stack>
            </Card>

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
                  loading={submitting && selectedStatus === "Refused"}
                >
                  Não Posso Ir
                </Button>
              </Group>
            </Stack>

            <Text ta="center" size="xs" c="dimmed">
              Obrigado por confirmar sua presença com a gente! 🎉
            </Text>
          </Stack>
        </Card>
      </Stack>
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
