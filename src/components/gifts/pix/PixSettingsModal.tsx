import { MobileFullscreenModal } from '@/components/MobileFullscreenModal';
import { PixGiftPreview } from '@/components/gifts/pix/PixGiftPreview';
import {
  buildPixCopyPasteCode,
  buildPixPayload,
  buildPixShareUrl,
  getMyPixSettings,
  PixKeyType,
  PixSettingsPayload,
  savePixSettings,
  validatePixDraft,
} from '@/services/pixService';
import { inputStyles, primaryButtonStyles, softButtonStyles } from '@/styles';
import {
  Button,
  Grid,
  Group,
  Modal,
  Select,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';

type PixSettingsModalProps = {
  opened: boolean;
  onClose: () => void;
  coupleName: string;
};

const PIX_KEY_OPTIONS: Array<{ value: PixKeyType; label: string }> = [
  { value: 'cpf', label: 'CPF' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Aleatória' },
];

export function PixSettingsModal({ opened, onClose, coupleName }: PixSettingsModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof getMyPixSettings>> | null>(null);
  const [form, setForm] = useState<PixSettingsPayload & { share_hash?: string }>({
    enabled: false,
    pix_key_type: 'cpf',
    pix_key: '',
    recipient_name: coupleName,
    city: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [debouncedForm] = useDebouncedValue(form, 280);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!opened) return;

    let mounted = true;
    setLoading(true);
    setHasInteracted(false);
    setErrors({});
    setForm({
      enabled: false,
      pix_key_type: 'cpf',
      pix_key: '',
      recipient_name: coupleName,
      city: '',
    });

    getMyPixSettings()
      .then((response) => {
        if (!mounted || !response) return;
        setSettings(response);
        setForm({
          enabled: response.enabled,
          pix_key_type: response.pix_key_type,
          pix_key: response.pix_key,
          recipient_name: response.recipient_name,
          city: response.city,
          share_hash: response.share_hash,
        });
      })
      .catch(() => {
        if (!mounted) return;
        notifications.show({
          color: 'red',
          message: 'Não foi possível carregar as configurações PIX.',
        });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [opened, coupleName]);

  useEffect(() => {
    if (!opened || !hasInteracted) return;
    setErrors(validatePixDraft(form));
  }, [form, hasInteracted, opened]);

  useEffect(() => {
    if (!opened) return;

    setPreviewLoading(true);
    const timer = window.setTimeout(() => {
      setPreviewLoading(false);
    }, 280);

    return () => window.clearTimeout(timer);
  }, [debouncedForm, opened]);

  const previewPayload = useMemo(() => {
    return buildPixPayload({
      ...debouncedForm,
      share_hash: debouncedForm.share_hash || settings?.share_hash || 'MARRIPLAN',
    });
  }, [debouncedForm, settings?.share_hash]);

  const previewCopyCode = useMemo(() => {
    return buildPixCopyPasteCode({
      ...debouncedForm,
      share_hash: debouncedForm.share_hash || settings?.share_hash || 'MARRIPLAN',
    });
  }, [debouncedForm, settings?.share_hash]);

  const handleChange = (field: keyof (PixSettingsPayload & { share_hash?: string }), value: string | boolean) => {
    setHasInteracted(true);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewCopyCode);
      notifications.show({ color: 'green', message: 'Código PIX copiado.' });
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível copiar o código PIX.' });
    }
  };

  const handleShare = async () => {
    const shareUrl = settings?.share_url || (form.share_hash ? buildPixShareUrl(form.share_hash) : '');
    if (!shareUrl) {
      notifications.show({ color: 'red', message: 'Salve as configurações para gerar o link público.' });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      notifications.show({ color: 'green', message: 'Link público copiado.' });
    } catch {
      notifications.show({ color: 'red', message: 'Não foi possível copiar o link público.' });
    }
  };

  const handleSubmit = async () => {
    const nextErrors = validatePixDraft(form);
    setErrors(nextErrors);
    setHasInteracted(true);

    if (Object.keys(nextErrors).length > 0) {
      notifications.show({ color: 'red', message: 'Corrija os campos destacados antes de salvar.' });
      return;
    }

    setSaving(true);
    try {
      const response = await savePixSettings(form);
      setSettings(response);
      setForm({
        enabled: response.enabled,
        pix_key_type: response.pix_key_type,
        pix_key: response.pix_key,
        recipient_name: response.recipient_name,
        city: response.city,
        share_hash: response.share_hash,
      });
      notifications.show({ color: 'green', message: 'Configurações PIX salvas com sucesso.' });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 'Não foi possível salvar as configurações PIX.';
      notifications.show({ color: 'red', message: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const formContent = (
    <Stack gap="md">
      <Switch
        label="Ativar recebimento PIX"
        checked={form.enabled}
        onChange={(event) => handleChange('enabled', event.currentTarget.checked)}
        error={errors.enabled}
      />

      <Select
        label="Tipo de chave"
        required
        data={PIX_KEY_OPTIONS}
        value={form.pix_key_type}
        onChange={(value) => handleChange('pix_key_type', (value as PixKeyType) || 'cpf')}
        error={errors.pix_key_type}
        styles={inputStyles}
      />

      <TextInput
        label="Chave PIX"
        required
        value={form.pix_key}
        onChange={(event) => handleChange('pix_key', event.currentTarget.value)}
        error={errors.pix_key}
        styles={inputStyles}
      />

      <TextInput
        label="Nome exibido"
        required
        value={form.recipient_name}
        onChange={(event) => handleChange('recipient_name', event.currentTarget.value)}
        error={errors.recipient_name}
        styles={inputStyles}
      />

      <TextInput
        label="Cidade"
        required
        value={form.city}
        onChange={(event) => handleChange('city', event.currentTarget.value)}
        error={errors.city}
        styles={inputStyles}
      />

      <Text size="sm" c="dimmed">
        O QR Code visual é gerado no frontend com o payload retornado pelo backend.
      </Text>
    </Stack>
  );

  const preview = (
    <PixGiftPreview
      coupleName={coupleName}
      recipientName={form.recipient_name}
      city={form.city}
      qrCodePayload={previewPayload}
      pixCopyPasteCode={previewCopyCode}
      shareUrl={settings?.share_url || (form.share_hash ? buildPixShareUrl(form.share_hash) : '')}
      loading={loading || previewLoading}
      onCopy={handleCopy}
      onShare={handleShare}
    />
  );

  const footer = (
    <Group grow>
      <Button variant="default" onClick={onClose} styles={softButtonStyles} fullWidth>
        Cancelar
      </Button>
      <Button onClick={handleSubmit} loading={saving} styles={primaryButtonStyles} fullWidth>
        Salvar
      </Button>
    </Group>
  );

  if (isMobile) {
    return (
      <MobileFullscreenModal opened={opened} onClose={onClose} title="Receber Presente via PIX" footer={footer}>
        <Stack gap="lg">
          {loading ? <Skeleton height={260} radius="xl" /> : formContent}
          {preview}
        </Stack>
      </MobileFullscreenModal>
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Receber Presente via PIX" size="xl" centered>
      <Grid gutter="xl">
        <Grid.Col span={6}>
          {loading ? <Skeleton height={420} radius="xl" /> : formContent}
        </Grid.Col>
        <Grid.Col span={6}>
          {preview}
        </Grid.Col>
      </Grid>

      <Group mt="lg" grow>
        <Button variant="default" onClick={onClose} styles={softButtonStyles} fullWidth>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} loading={saving} styles={primaryButtonStyles} fullWidth>
          Salvar
        </Button>
      </Group>
    </Modal>
  );
}