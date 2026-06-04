import { Badge, Box, Button, Card, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useQRCode } from 'next-qrcode';
import { IconCopy, IconShare } from '@tabler/icons-react';

type PixGiftPreviewProps = {
  coupleName: string;
  recipientName: string;
  qrCodePayload?: string;
  pixCopyPasteCode?: string;
  shareUrl?: string;
  amountLabel?: string;
  loading?: boolean;
  onCopy?: () => Promise<void> | void;
  onShare?: () => Promise<void> | void;
};

export function PixGiftPreview({
  coupleName,
  recipientName,
  qrCodePayload,
  pixCopyPasteCode,
  shareUrl,
  amountLabel,
  loading = false,
  onCopy,
  onShare,
}: PixGiftPreviewProps) {
  const { Canvas } = useQRCode();
  const displayName = recipientName || coupleName;
  const resolvedShareUrl = shareUrl || '';

  return (
    <Card
      radius="xl"
      withBorder
      shadow="sm"
      p="lg"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(250,245,239,0.96) 100%)',
        borderColor: 'var(--marriplan-border)',
      }}
    >
      <Stack gap="md">
        <Stack gap={6} ta="center">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: 1.2 }}>
            Presente via PIX
          </Text>
          <Title order={3}>💖 Presenteie {displayName || 'o casal'}</Title>
          <Text c="dimmed">Contribua com qualquer valor via PIX.</Text>
          {amountLabel ? (
            <Group justify="center" gap="xs">
              <Badge variant="light" color="gray" radius="xl">
                Valor escolhido
              </Badge>
              <Badge radius="xl">{amountLabel}</Badge>
            </Group>
          ) : null}
        </Stack>

        {loading ? (
          <Stack align="center" gap="sm" py="sm">
            <Skeleton height={220} width={220} radius="lg" />
            <Skeleton height={18} width="70%" radius="xl" />
            <Skeleton height={36} width="100%" radius="xl" />
          </Stack>
        ) : (
          <Stack gap="md" align="center">
            <Box
              style={{
                width: 252,
                height: 252,
                borderRadius: 28,
                border: '1px solid var(--marriplan-border)',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 22px 50px rgba(171, 132, 112, 0.12)',
                overflow: 'hidden',
              }}
            >
              {qrCodePayload ? (
                <Canvas
                  text={qrCodePayload}
                  options={{
                    errorCorrectionLevel: 'M',
                    margin: 1,
                    width: 228,
                    color: {
                      dark: '#1d1a17',
                      light: '#ffffff',
                    },
                  }}
                />
              ) : (
                <Text size="sm" c="dimmed" ta="center" px="md">
                  QR Code será gerado assim que a chave PIX estiver salva.
                </Text>
              )}
            </Box>

            <Stack gap={6} w="100%">
              <Button
                fullWidth
                leftSection={<IconCopy size={16} />}
                disabled={!pixCopyPasteCode}
                onClick={onCopy}
                styles={{
                  root: {
                    background: 'var(--marriplan-rose)',
                    '&:hover': { background: 'var(--marriplan-gold)' },
                  },
                }}
              >
                Copiar código PIX
              </Button>

              <Button
                fullWidth
                variant="default"
                leftSection={<IconShare size={16} />}
                disabled={!resolvedShareUrl}
                onClick={onShare}
              >
                Compartilhar
              </Button>
            </Stack>

            <Box
              style={{
                width: '100%',
                borderRadius: 18,
                border: '1px solid var(--marriplan-border)',
                background: 'rgba(255,255,255,0.8)',
                padding: 14,
                wordBreak: 'break-all',
              }}
            >
              <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb={6}>
                Código copia e cola
              </Text>
              {loading ? (
                <Skeleton height={40} radius="md" />
              ) : (
                <Text size="xs" style={{ fontFamily: 'monospace', lineHeight: 1.6 }}>
                  {pixCopyPasteCode || 'Código PIX indisponível.'}
                </Text>
              )}
            </Box>

            <Text size="sm" c="dimmed" ta="center">
              {resolvedShareUrl ? `` : 'O link público será liberado após salvar as configurações.'}
            </Text>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}