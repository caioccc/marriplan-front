import { Badge, Box, Button, Card, Group, Image, Stack, Text } from '@mantine/core';
import { IconCalendar, IconHeart, IconMapPin, IconPaperclip, IconSparkles } from '@tabler/icons-react';
import { Supplier, WeddingSupplier } from '@/services/suppliers';

interface SupplierCardProps {
  supplier: Supplier;
  weddingSupplier?: WeddingSupplier | null;
  compact?: boolean;
  onView?: (supplier: Supplier) => void;
  onAdd?: (supplier: Supplier) => void;
}

function formatCurrency(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return 'A combinar';
  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) return 'A combinar';
  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function SupplierCard({ supplier, weddingSupplier, compact = false, onView, onAdd }: SupplierCardProps) {
  const imageUrl = supplier.cover_image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80';
  const categoryLabel = supplier.category_detail?.name || 'Fornecedor';
  const cityLabel = [supplier.city, supplier.state].filter(Boolean).join(' • ') || 'Local não informado';
  const statusLabel = weddingSupplier?.status
    ? {
        QUOTING: 'Cotando',
        NEGOTIATING: 'Negociando',
        HIRED: 'Contratado',
        PAID: 'Pago',
        CANCELED: 'Cancelado',
      }[weddingSupplier.status]
    : supplier.status === 'APPROVED'
      ? 'Aprovado'
      : 'Pendente';

  return (
    <Card radius="xl" withBorder shadow="sm" style={{ overflow: 'hidden', background: 'rgba(255,255,255,0.92)' }}>
      <Box style={{ position: 'relative' }}>
        <Image src={imageUrl} alt={supplier.name} height={compact ? 168 : 220} />
        <Box style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <Badge radius="xl" color={supplier.is_featured ? 'orange' : 'gray'} variant="filled">
            {supplier.is_featured ? 'Destaque' : categoryLabel}
          </Badge>
          {/* <Badge radius="xl" color={supplier.status === 'APPROVED' ? 'green' : 'yellow'} variant="light">
            {statusLabel}
          </Badge> */}
        </Box>
      </Box>
      <Stack gap="sm" p="md">
        <Stack gap={4}>
          <Text fw={700} size={compact ? 'md' : 'lg'} lineClamp={1}>
            {supplier.name}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {supplier.description || supplier.company_name || 'Descrição em breve.'}
          </Text>
        </Stack>
        <Group gap="xs" wrap="wrap">
          <Badge variant="light" leftSection={<IconMapPin size={12} />}>
            {cityLabel}
          </Badge>
          {weddingSupplier?.is_favorite ? (
            <Badge color="pink" variant="light" leftSection={<IconHeart size={12} />}>
              Favorito
            </Badge>
          ) : null}
          {weddingSupplier?.contract_file_url ? (
            <Badge color="blue" variant="light" leftSection={<IconPaperclip size={12} />}>
              Contrato
            </Badge>
          ) : null}
        </Group>
        {weddingSupplier ? (
          <Group justify="space-between" gap="sm" wrap="wrap">
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Estimado</Text>
              <Text fw={600}>{formatCurrency(weddingSupplier.estimated_price)}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Negociado</Text>
              <Text fw={600}>{formatCurrency(weddingSupplier.negotiated_price)}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Pago</Text>
              <Text fw={600}>{formatCurrency(weddingSupplier.paid_amount)}</Text>
            </Stack>
          </Group>
        ) : null}
        <Group gap="xs" justify="space-between" wrap="wrap" mt="xs">
          <Group gap={6}>
            <IconSparkles size={14} color="var(--marriplan-rose)" />
            <Text size="xs" c="dimmed" lineClamp={1}>{categoryLabel}</Text>
          </Group>
          <Group gap={6}>
            <IconCalendar size={14} color="var(--marriplan-gold)" />
            <Text size="xs" c="dimmed">{supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('pt-BR') : 'Novo'}</Text>
          </Group>
        </Group>
        <Group grow mt="xs">
          <Button variant="default" radius="xl" onClick={() => onView?.(supplier)}>
            Visualizar
          </Button>
          {onAdd ? (
            <Button radius="xl" onClick={() => onAdd(supplier)}>
              {weddingSupplier ? 'Gerenciar' : 'Adicionar ao casamento'}
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Card>
  );
}
