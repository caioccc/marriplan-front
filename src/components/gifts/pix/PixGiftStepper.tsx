import { PixGiftPreview } from '@/components/gifts/pix/PixGiftPreview';
import { getPublicPixSettings, PublicPixSettingsRecord } from '@/services/pixService';
import { Button, Card, Group, NumberInput, SimpleGrid, Stack, Stepper, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCrown,
  IconGlassFull,
  IconHeartHandshake,
  IconPlaneDeparture,
  IconStar,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';

type PixGiftStepperProps = {
  shareHash: string;
  coupleName: string;
  initialSettings?: PublicPixSettingsRecord | null;
};

const PRESET_AMOUNTS = [50, 100, 200, 400, 500];

const PRESET_COPY: Record<number, { title: string; description: string; icon: typeof IconGlassFull }> = {
  50: {
    title: 'Um brinde aos noivos',
    description: '🥂',
    icon: IconGlassFull,
  },
  100: {
    title: 'Uma força na Lua de Mel',
    description: '✈️',
    icon: IconPlaneDeparture,
  },
  200: {
    title: 'Amigo do peito',
    description: '❤️',
    icon: IconHeartHandshake,
  },
  400: {
    title: 'Presentaço de respeito',
    description: '🌟',
    icon: IconStar,
  },
  500: {
    title: 'Patrocinador oficial do amor',
    description: '👑',
    icon: IconCrown,
  },
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseAmountValue(value: number | string | null) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const normalized = String(value).replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function PixGiftStepper({ shareHash, coupleName, initialSettings = null }: PixGiftStepperProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom' | null>(50);
  const [customAmount, setCustomAmount] = useState<number | string | ''>('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PublicPixSettingsRecord | null>(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const amountValue = useMemo(() => {
    if (selectedPreset === 'custom') {
      return parseAmountValue(customAmount);
    }

    return typeof selectedPreset === 'number' ? selectedPreset : 0;
  }, [customAmount, selectedPreset]);

  const amountLabel = amountValue > 0 ? formatCurrency(amountValue) : '';

  const previewSettings = settings || initialSettings;
  const resolvedName = previewSettings?.recipient_name || coupleName;
  const resolvedCity = previewSettings?.city || '';

  const handleContinue = async () => {
    if (!shareHash) return;

    if (!amountValue || amountValue <= 0) {
      notifications.show({ color: 'red', message: 'Selecione um valor para continuar.' });
      return;
    }

    setLoading(true);
    try {
      const response = await getPublicPixSettings(shareHash, amountValue);
      setSettings(response);
      setActiveStep(1);
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível gerar o PIX com este valor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!settings?.pix_copy_paste_code) return;
    try {
      await navigator.clipboard.writeText(settings.pix_copy_paste_code);
      notifications.show({ color: 'green', message: 'Código PIX copiado.' });
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível copiar o código PIX.' });
    }
  };

  const handleShare = async () => {
    if (!settings?.share_url) return;
    try {
      await navigator.clipboard.writeText(settings.share_url);
      notifications.show({ color: 'green', message: 'Link público copiado.' });
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível copiar o link público.' });
    }
  };

  return (
    <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm">
      <Stepper.Step label="Escolha o valor" description="Selecione um presente">
        <Stack gap="lg">
          <Stack gap={6} ta="center">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: 1.2 }}>
              Presente via PIX
            </Text>
            <Title order={3}>Quanto você quer presentear?</Title>
            <Text c="dimmed">Escolha um dos valores sugeridos ou informe outro valor para gerar o PIX.</Text>
          </Stack>

          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
            {PRESET_AMOUNTS.map((amount) => {
              const selected = selectedPreset === amount;
              const copy = PRESET_COPY[amount];
              const Icon = copy.icon;
              return (
                <Card
                  key={amount}
                  withBorder
                  radius="xl"
                  shadow={selected ? 'md' : 'xs'}
                  padding="md"
                  onClick={() => setSelectedPreset(amount)}
                  style={{
                    cursor: 'pointer',
                    borderColor: selected ? 'var(--marriplan-rose)' : 'var(--marriplan-border)',
                    background: selected ? 'rgba(231, 161, 153, 0.12)' : '#fff',
                    transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                  }}
                >
                  <Stack gap={6} align="center" justify="center" mih={108}>
                    <Icon size={24} stroke={1.6} />
                    <Text fw={700}>{formatCurrency(amount)}</Text>
                    <Text fw={600} ta="center" lh={1.2}>
                      {copy.title}
                    </Text>
                    <Text size="xs" c="dimmed" ta="center">
                      {copy.description}
                    </Text>
                  </Stack>
                </Card>
              );
            })}

            <Card
              withBorder
              radius="xl"
              shadow={selectedPreset === 'custom' ? 'md' : 'xs'}
              padding="md"
              onClick={() => setSelectedPreset('custom')}
              style={{
                cursor: 'pointer',
                borderColor: selectedPreset === 'custom' ? 'var(--marriplan-rose)' : 'var(--marriplan-border)',
                background: selectedPreset === 'custom' ? 'rgba(231, 161, 153, 0.12)' : '#fff',
              }}
            >
              <Stack gap={4} align="center" justify="center" mih={88}>
                <Text fw={700}>Outro valor</Text>
                <Text size="xs" c="dimmed" ta="center">
                  Defina um valor personalizado
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          {selectedPreset === 'custom' ? (
            <NumberInput
              label="Valor personalizado"
              placeholder="Digite o valor"
              prefix="R$ "
              value={customAmount}
              onChange={setCustomAmount}
              min={1}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator="."
              decimalSeparator=","
            />
          ) : null}

          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              {amountLabel ? `Valor selecionado: ${amountLabel}` : 'Selecione um valor para continuar.'}
            </Text>
            <Button
              rightSection={<IconArrowRight size={16} />}
              onClick={handleContinue}
              loading={loading}
              disabled={!amountValue || amountValue <= 0}
              styles={{
                root: {
                  background: 'var(--marriplan-rose)',
                  '&:hover': { background: 'var(--marriplan-gold)' },
                },
              }}
            >
              Gerar PIX
            </Button>
          </Group>
        </Stack>
      </Stepper.Step>

      <Stepper.Step label="PIX pronto" description="Escaneie ou copie">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => setActiveStep(0)}>
              Trocar valor
            </Button>
            {amountLabel ? (
              <Text fw={700} c="var(--marriplan-text)">
                {amountLabel}
              </Text>
            ) : null}
          </Group>

          <PixGiftPreview
            coupleName={coupleName}
            recipientName={resolvedName}
            city={resolvedCity}
            qrCodePayload={settings?.qr_code_payload}
            pixCopyPasteCode={settings?.pix_copy_paste_code}
            shareUrl={settings?.share_url}
            amountLabel={amountLabel}
            loading={loading || !settings}
            onCopy={handleCopy}
            onShare={handleShare}
          />
        </Stack>
      </Stepper.Step>
    </Stepper>
  );
}
