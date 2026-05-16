import { Button, Container, Stack, Text, Title, Card, Center } from '@mantine/core';
import { useRouter } from 'next/router';
import { primaryButtonStyles, softButtonStyles } from '@/styles';
import { IconHeart } from '@tabler/icons-react';

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <Container size="sm" py={80}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack align="center" gap="md">
          <IconHeart size={48} color="var(--marriplan-rose)" />
          <Title order={2}>Obrigado pela confirmação!</Title>
          <Text c="dimmed" ta="center">A sua resposta foi registrada com sucesso. Estamos felizes em contar com você no nosso dia.</Text>
          {/* <Center style={{ width: '100%' }}>
            <Button styles={primaryButtonStyles} onClick={() => router.push('/')}>Voltar ao Início</Button>
            <Button styles={softButtonStyles} onClick={() => router.push('/meu-site')} style={{ marginLeft: 8 }}>Ver meu site</Button>
          </Center> */}
        </Stack>
      </Card>
    </Container>
  );
}
