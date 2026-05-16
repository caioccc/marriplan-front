import BaseLayout from '@/components/Layout/_BaseLayout';
import { SupplierCard } from '@/components/SupplierCard';
import { listWeddingSuppliers, WeddingSupplier } from '@/services/suppliers';
import { inputStyles, primaryButtonStyles, segmentedTabsStyles, softButtonStyles } from '@/styles';
import { Badge, Button, Card, Group, Loader, Pagination, Select, SimpleGrid, Stack, Text, TextInput, Title, SegmentedControl } from '@mantine/core';
import { IconCards, IconLayoutGrid, IconPlus, IconSearch, IconTable } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

function formatCurrency(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return 'A combinar';
  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) return 'A combinar';
  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MySuppliersPage() {
  const router = useRouter();
  const [items, setItems] = useState<WeddingSupplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'gallery'>('cards');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await listWeddingSuppliers({
          page,
          page_size: pageSize,
          search,
          status,
          favorite: favoriteOnly ? 'true' : '',
          ordering: '-is_favorite,-updated_at',
        });
        if (!mounted) return;
        setItems(data.results || []);
        setTotal(data.count || 0);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [page, search, status, favoriteOnly]);

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        supplier_name: item.supplier_detail?.name || '-',
        category_name: item.supplier_detail?.category_detail?.name || '-',
        location: [item.supplier_detail?.city, item.supplier_detail?.state].filter(Boolean).join(' • ') || '-',
      })),
    [items],
  );

  return (
    <BaseLayout title="Meus Fornecedores">
      <Stack gap="lg" py="md">
        <Card radius="xl" p="xl" withBorder style={{ background: 'linear-gradient(135deg, #fffdf9 0%, #f6eee4 100%)' }}>
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Stack gap={4} style={{ maxWidth: 680 }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: 1.2 }}>
                Gestão do casamento
              </Text>
              <Title order={2}>Meus Fornecedores</Title>
              <Text c="dimmed">
                Acompanhe status, valores, favoritos e contratos no mesmo lugar.
              </Text>
            </Stack>
            <SegmentedControl
              value={viewMode}
              onChange={(value) => setViewMode(value as typeof viewMode)}
              data={[
                { value: 'table', label: <IconTable size={16} /> },
                { value: 'cards', label: <IconCards size={16} /> },
                { value: 'gallery', label: <IconLayoutGrid size={16} /> },
              ]}
              styles={segmentedTabsStyles}
            />
          </Group>
          <Group justify="flex-end" mt="md">
            <Group gap="sm">
              <Button variant="default" styles={softButtonStyles} onClick={() => router.push('/fornecedores')}>
                Ir ao marketplace
              </Button>
              <Button leftSection={<IconPlus size={18} />} styles={primaryButtonStyles} onClick={() => router.push('/fornecedores')}>
                Adicionar fornecedor
              </Button>
            </Group>
          </Group>
        </Card>

        <Card radius="xl" p="md" withBorder>
          <Group grow align="flex-end" wrap="wrap">
            <TextInput
              label="Buscar"
              placeholder="Nome do fornecedor"
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                setPage(1);
              }}
              styles={inputStyles}
            />
            <Select
              label="Status"
              data={[
                { value: '', label: 'Todos' },
                { value: 'QUOTING', label: 'Cotando' },
                { value: 'NEGOTIATING', label: 'Negociando' },
                { value: 'HIRED', label: 'Contratado' },
                { value: 'PAID', label: 'Pago' },
                { value: 'CANCELED', label: 'Cancelado' },
              ]}
              value={status}
              onChange={(value) => {
                setStatus(value || '');
                setPage(1);
              }}
              styles={inputStyles}
            />
            <Select
              label="Favoritos"
              data={[
                { value: 'all', label: 'Todos' },
                { value: 'only', label: 'Somente favoritos' },
              ]}
              value={favoriteOnly ? 'only' : 'all'}
              onChange={(value) => {
                setFavoriteOnly(value === 'only');
                setPage(1);
              }}
              styles={inputStyles}
            />
          </Group>
          <Group justify="space-between" mt="md" wrap="wrap">
            <Text size="sm" c="dimmed">{total} fornecedores no casamento</Text>
          </Group>
        </Card>

        {loading ? (
          <Card radius="xl" p="xl" withBorder>
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          </Card>
        ) : items.length === 0 ? (
          <Card radius="xl" p="xl" withBorder>
            <Stack align="center" gap="sm" py="xl">
              <Badge radius="xl" color="gray" variant="light">Lista vazia</Badge>
              <Title order={4}>Você ainda não adicionou fornecedores</Title>
              <Text c="dimmed" ta="center" maw={480}>
                Comece pelo marketplace e acompanhe tudo em uma visão simples depois.
              </Text>
              <Button leftSection={<IconPlus size={18} />} onClick={() => router.push('/fornecedores')}>
                Ir para marketplace
              </Button>
            </Stack>
          </Card>
        ) : viewMode === 'cards' ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {items.map((item) => (
              <SupplierCard
                key={item.id}
                supplier={item.supplier_detail!}
                weddingSupplier={item}
                onView={(supplier) => router.push(`/fornecedores/${supplier.id}`)}
                onAdd={(supplier) => router.push(`/fornecedores/${supplier.id}`)}
              />
            ))}
          </SimpleGrid>
        ) : viewMode === 'gallery' ? (
          <Stack gap="md">
            {items.map((item) => (
              <SupplierCard
                key={item.id}
                supplier={item.supplier_detail!}
                weddingSupplier={item}
                compact
                onView={(supplier) => router.push(`/fornecedores/${supplier.id}`)}
                onAdd={(supplier) => router.push(`/fornecedores/${supplier.id}`)}
              />
            ))}
          </Stack>
        ) : (
          <Card radius="xl" p="sm" withBorder>
            <DataTable
              records={rows}
              columns={[
                { accessor: 'supplier_name', title: 'Fornecedor' },
                { accessor: 'category_name', title: 'Categoria' },
                { accessor: 'location', title: 'Cidade/Estado' },
                {
                  accessor: 'status',
                  title: 'Status',
                  render: (record) => (
                    <Badge color={record.status === 'HIRED' || record.status === 'PAID' ? 'green' : record.status === 'CANCELED' ? 'red' : 'yellow'} variant="light">
                      {record.status === 'QUOTING' && 'Cotando'}
                      {record.status === 'NEGOTIATING' && 'Negociando'}
                      {record.status === 'HIRED' && 'Contratado'}
                      {record.status === 'PAID' && 'Pago'}
                      {record.status === 'CANCELED' && 'Cancelado'}
                    </Badge>
                  ),
                },
                {
                  accessor: 'values',
                  title: 'Valores',
                  render: (record) => (
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed">{formatCurrency(record.estimated_price)}</Text>
                      <Text size="xs" c="dimmed">{formatCurrency(record.negotiated_price)}</Text>
                    </Stack>
                  ),
                },
                {
                  accessor: 'actions',
                  title: '',
                  render: (record) => (
                    <Button size="xs" variant="light" onClick={() => router.push(`/fornecedores/${record.supplier_detail?.id || record.id}`)}>
                      Abrir
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        )}

        {total > pageSize ? (
          <Group justify="center">
            <Pagination value={page} onChange={setPage} total={Math.max(1, Math.ceil(total / pageSize))} />
          </Group>
        ) : null}
      </Stack>
    </BaseLayout>
  );
}
