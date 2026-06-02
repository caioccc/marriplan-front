import BaseLayout from "@/components/Layout/_BaseLayout";
import { useAuth } from "@/contexts/AuthContext";
import { startCheckoutSession } from "@/services/billing";
import { Alert, Button, Card, Container, Group, Stack, Text, Title } from "@mantine/core";
import { IconLoader2, IconSparkles } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useMemo, useState, useEffect } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [startingCheckout, setStartingCheckout] = useState(false);
  const success = useMemo(() => router.query.success === "1", [router.query.success]);
  const canceled = useMemo(() => router.query.canceled === "1", [router.query.canceled]);
  const primaryButtonLabel = success ? "Ir para o dashboard" : "Pagar";

  const redirectToCheckout = async () => {
    try {
      setErrorMessage("");
      setLoading(true);
      setStartingCheckout(true);

      const baseUrl = window.location.origin;
      const payload = {
        plan_slug: "premium",
        success_url: `${baseUrl}/checkout?success=1`,
        cancel_url: `${baseUrl}/plans?canceled=1`,
      };

      const session = await startCheckoutSession(payload);

      if (session.checkout_url) {
        window.location.href = session.checkout_url;
        return;
      }

      throw new Error("Checkout sem URL de redirecionamento.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível iniciar o checkout.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setStartingCheckout(false);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    if (success || canceled) {
      setLoading(false);
      // if (success) {
      //   void refreshUser();
      // }
      return;
    }

    void redirectToCheckout();
  }, [canceled, refreshUser, router.isReady, success]);

  return (
    <BaseLayout>
      <Container size="md" py="xl">
        <Card
          radius="xl"
          p="xl"
          withBorder
          className="marriplan-card"
          style={{ background: "var(--marriplan-surface)" }}
        >
          <Stack gap="md">
            <Text
              size="xs"
              tt="uppercase"
              fw={700}
              style={{ letterSpacing: 2, color: "var(--marriplan-rose)" }}
            >
              Upgrade de plano
            </Text>
            <Title order={2}>Checkout</Title>
            {loading && !errorMessage && !success && !canceled && (
              <Group gap="sm">
                <IconLoader2 size={18} className="animate-spin" />
                <Text size="sm" c="dimmed">
                  Preparando seu acesso ao Stripe Checkout...
                </Text>
              </Group>
            )}

            {success && (
              <Alert color="green" title="Assinatura em atualização" variant="light">
                O checkout foi concluído no Stripe. Se o plano ainda não aparecer, aguarde alguns segundos para o webhook atualizar sua assinatura.
              </Alert>
            )}

            {canceled && (
              <Alert color="yellow" title="Checkout cancelado" variant="light">
                Você pode voltar quando quiser e continuar de onde parou.
              </Alert>
            )}

            {errorMessage && (
              <Alert color="red" title="Não foi possível iniciar o checkout" variant="light">
                {errorMessage}
              </Alert>
            )}

            <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>
              Seu plano Premium libera convidados ilimitados, checklist completo, inspirações salvas, exportações e IA.
            </Text>
            {/* Aviso de redirecionamento automático */}
            {/* <Alert variant="light" color="blue">
              Você será redirecionado automaticamente ao Stripe Checkout em instantes. Se preferir, clique em Ir para o Stripe.
            </Alert> */}

            <Group justify="space-between" wrap="wrap">
              <Button
                component="a"
                href="/plans"
                variant="light"
                style={{ background: "var(--marriplan-champagne)", color: "var(--marriplan-text)" }}
              >
                Ver planos
              </Button>
              {success ? (
                <Button
                  component="a"
                  href="/dashboard"
                  leftSection={<IconSparkles size={16} />}
                  style={{ background: "var(--marriplan-rose)", color: "#fff" }}
                >
                  {primaryButtonLabel}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    void redirectToCheckout();
                  }}
                  leftSection={<IconSparkles size={16} />}
                  style={{ background: "var(--marriplan-rose)", color: "#fff" }}
                  loading={loading || startingCheckout}
                >
                  {primaryButtonLabel}
                </Button>
              )}
            </Group>
          </Stack>
        </Card>
      </Container>
    </BaseLayout>
  );
}
