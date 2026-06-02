import { PALETTE } from "@/styles";
import { Card, Container, Stack, Text, Title } from "@mantine/core";
import { IconHeart } from "@tabler/icons-react";
import { useRouter } from "next/router";

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <Container size="sm" py={80} h="100dvh">
      <Stack align="center" gap="md">
        <Text
          fw={800}
          size="lg"
          c={PALETTE.ink}
          onClick={() => router.push("/")}
          style={{ letterSpacing: -0.5, cursor: "pointer" }}
        >
          Marriplan<span style={{ color: PALETTE.roseGold }}>.</span>
        </Text>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack align="center" gap="md">
            <IconHeart size={48} color="var(--marriplan-rose)" />
            <Title order={2}>Obrigado pela confirmação!</Title>
            <Text c="dimmed" ta="center">
              A sua resposta foi registrada com sucesso. Estamos felizes em
              contar com você no nosso dia.
            </Text>
            {/* <Center style={{ width: '100%' }}>
            <Button styles={primaryButtonStyles} onClick={() => router.push('/')}>Voltar ao Início</Button>
            <Button styles={softButtonStyles} onClick={() => router.push('/meu-site')} style={{ marginLeft: 8 }}>Ver meu site</Button>
          </Center> */}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
