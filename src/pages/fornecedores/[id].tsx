import BaseLayout from '@/components/Layout/_BaseLayout';
import { SupplierCard } from '@/components/SupplierCard';
import {
  getSupplier,
  listWeddingSuppliers,
  selectSupplierForWedding,
  updateWeddingSupplier,
  uploadSupplierContract,
  Supplier,
  WeddingSupplier,
} from '@/services/suppliers';
import { inputStyles, primaryButtonStyles, softButtonStyles } from '@/styles';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconPaperclip, IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

function formatCurrencyInput(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return normalized;
}

export default function SupplierDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [weddingSupplier, setWeddingSupplier] = useState<WeddingSupplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    status: 'QUOTING' as NonNullable<WeddingSupplier['status']>,
    is_favorite: false,
    estimated_price: '',
    negotiated_price: '',
    paid_amount: '',
    notes: '',
  });

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const supplierData = await getSupplier(Number(id));
        const weddingData = await listWeddingSuppliers({ supplier: Number(id), page_size: 1 });
        if (!mounted) return;
        setSupplier(supplierData);
        const relation = weddingData.results?.[0] || null;
        setWeddingSupplier(relation);
        if (relation) {
          setForm({
            status: relation.status || 'QUOTING',
            is_favorite: !!relation.is_favorite,
            estimated_price: relation.estimated_price ? String(relation.estimated_price) : '',
            negotiated_price: relation.negotiated_price ? String(relation.negotiated_price) : '',
            paid_amount: relation.paid_amount ? String(relation.paid_amount) : '',
            notes: relation.notes || '',
          });
        }
      } catch (error) {
        console.error(error);
        notifications.show({ color: 'red', message: 'Não foi possível carregar o fornecedor.' });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSave = async () => {
    if (!supplier) return;
    setSaving(true);
    try {
      let relation = weddingSupplier;
      const weddingPayload = {
        status: form.status,
        is_favorite: form.is_favorite,
        estimated_price: formatCurrencyInput(form.estimated_price),
        negotiated_price: formatCurrencyInput(form.negotiated_price),
        paid_amount: formatCurrencyInput(form.paid_amount),
        notes: form.notes,
      };

      if (!relation) {
        relation = await selectSupplierForWedding({
          supplier_id: supplier.id,
          ...weddingPayload,
        });
      } else {
        relation = await updateWeddingSupplier(relation.id, weddingPayload);
      }

      if (contractFile) {
        const uploaded = await uploadSupplierContract(contractFile);
        relation = await updateWeddingSupplier(relation.id, {
          contract_file_url: uploaded.url,
          contract_file_public_id: uploaded.public_id,
        });
      }

      setWeddingSupplier(relation);
      notifications.show({
        color: 'green',
        message: relation.contract_file_url
          ? 'Fornecedor adicionado ao casamento com contrato anexado.'
          : 'Fornecedor adicionado ao casamento com sucesso.',
      });
      router.push('/meus-fornecedores');
    } catch (error) {
      console.error(error);
      notifications.show({ color: 'red', message: 'Não foi possível salvar o fornecedor.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Fornecedor">
        <Card radius="xl" p="xl" withBorder>
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        </Card>
      </BaseLayout>
    );
  }

  if (!supplier) {
    return (
      <BaseLayout title="Fornecedor">
        <Card radius="xl" p="xl" withBorder>
          <Stack align="center" gap="sm" py="xl">
            <Title order={3}>Fornecedor não encontrado</Title>
            <Text c="dimmed">Volte ao marketplace e tente novamente.</Text>
            <Button leftSection={<IconArrowLeft size={18} />} onClick={() => router.push('/fornecedores')}>
              Voltar
            </Button>
          </Stack>
        </Card>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={supplier.name}>
      <Stack gap="lg" py="md">
        <Card radius="xl" p="xl" withBorder>
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Stack gap={4} style={{ maxWidth: 660 }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: 1.2 }}>
                Detalhe do fornecedor
              </Text>
              <Title order={2}>{supplier.name}</Title>
              <Text c="dimmed">Adicione ao casamento, ajuste os valores e anexe o contrato opcional.</Text>
            </Stack>
            <Group>
              <Button variant="default" styles={softButtonStyles} leftSection={<IconArrowLeft size={18} />} onClick={() => router.back()}>
                Voltar
              </Button>
              <Button leftSection={<IconUpload size={18} />} styles={primaryButtonStyles} onClick={handleSave} loading={saving}>
                {weddingSupplier ? 'Salvar alterações' : 'Adicionar ao casamento'}
              </Button>
            </Group>
          </Group>
        </Card>

        <SupplierCard
          supplier={supplier}
          weddingSupplier={weddingSupplier}
          compact
        />

        <Card radius="xl" p="xl" withBorder>
          <Stack gap="md">
            <Group grow align="flex-start" wrap="wrap">
              <Select
                label="Status"
                data={[
                  { value: 'QUOTING', label: 'Cotando' },
                  { value: 'NEGOTIATING', label: 'Negociando' },
                  { value: 'HIRED', label: 'Contratado' },
                  { value: 'PAID', label: 'Pago' },
                  { value: 'CANCELED', label: 'Cancelado' },
                ]}
                value={form.status}
                onChange={(value) => setForm((prev) => ({ ...prev, status: (value || 'QUOTING') as typeof form.status }))}
                styles={inputStyles}
              />
              <Checkbox
                mt={28}
                label="Favorito"
                checked={form.is_favorite}
                onChange={(event) => setForm((prev) => ({ ...prev, is_favorite: event.currentTarget.checked }))}
              />
            </Group>

            <Group grow align="flex-start" wrap="wrap">
              <TextInput label="Valor estimado" value={form.estimated_price} onChange={(event) => setForm((prev) => ({ ...prev, estimated_price: event.currentTarget.value }))} styles={inputStyles} />
              <TextInput label="Valor negociado" value={form.negotiated_price} onChange={(event) => setForm((prev) => ({ ...prev, negotiated_price: event.currentTarget.value }))} styles={inputStyles} />
              <TextInput label="Valor pago" value={form.paid_amount} onChange={(event) => setForm((prev) => ({ ...prev, paid_amount: event.currentTarget.value }))} styles={inputStyles} />
            </Group>

            <Textarea
              label="Observações"
              minRows={4}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.currentTarget.value }))}
              styles={inputStyles}
            />

            <Card radius="lg" withBorder p="md" style={{ background: 'rgba(246,238,228,0.45)' }}>
              <Stack gap="sm">
                <Group justify="space-between" align="center" wrap="wrap">
                  <Group gap="xs">
                    <IconPaperclip size={16} />
                    <Text fw={600}>Contrato opcional</Text>
                  </Group>
                  <Button variant="default" onClick={() => fileInputRef.current?.click()}>
                    Escolher arquivo
                  </Button>
                </Group>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  style={{ display: 'none' }}
                  onChange={(event) => setContractFile(event.currentTarget.files?.[0] || null)}
                />
                <Text size="sm" c="dimmed">
                  Envie PDF ou imagem. Se houver um contrato antigo, ele será substituído no próximo salvamento.
                </Text>
                {contractFile ? (
                  <Badge color="blue" variant="light">
                    {contractFile.name}
                  </Badge>
                ) : weddingSupplier?.contract_file_url ? (
                  <Badge color="green" variant="light">Contrato já anexado</Badge>
                ) : null}
              </Stack>
            </Card>
          </Stack>
        </Card>
      </Stack>
    </BaseLayout>
  );
}
