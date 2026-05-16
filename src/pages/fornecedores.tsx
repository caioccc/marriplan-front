import BaseLayout from '@/components/Layout/_BaseLayout';
import { SupplierCard } from '@/components/SupplierCard';
import {
  createSupplier,
  listSupplierCategories,
  listSuppliers,
  Supplier,
  SupplierCategory,
} from '@/services/suppliers';
import { inputStyles, primaryButtonStyles, softButtonStyles } from '@/styles';
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

const VIEW_OPTIONS = [
  { value: 'cards', label: 'Cards' },
  { value: 'list', label: 'Lista' },
];

export default function SuppliersMarketplacePage() {
  const router = useRouter();
  const [items, setItems] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    company_name: '',
    description: '',
    phone: '',
    cnpj: '',
    whatsapp: '',
    email: '',
    instagram: '',
    website: '',
    city: '',
    state: '',
    cover_image_url: '',
  });

  const categoryOptions = useMemo(
    () => [
      { value: '', label: 'Todas as categorias' },
      ...categories.map((item) => ({ value: item.slug, label: item.name })),
    ],
    [categories],
  );

  const categoryFormOptions = useMemo(
    () => categories.map((item) => ({ value: String(item.id), label: item.name })),
    [categories],
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [supplierData, categoryData] = await Promise.all([
          listSuppliers({
            page,
            page_size: 12,
            search,
            category,
            city,
            state,
            ordering: '-is_featured,name',
          }),
          listSupplierCategories(),
        ]);
        if (!mounted) return;
        setItems(supplierData.results || []);
        setTotal(supplierData.count || 0);
        setCategories(categoryData.results || categoryData || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [page, search, category, city, state]);

  const handleCreateSupplier = async () => {
    if (!form.category_id || !form.name.trim()) {
      notifications.show({ color: 'red', message: 'Selecione uma categoria e informe o nome.' });
      return;
    }
    setSaving(true);
    try {
      const created = await createSupplier({
        ...form,
        status: 'PENDING',
        is_featured: false,
        category_id: Number(form.category_id),
      });
      notifications.show({
        color: 'green',
        message: 'Fornecedor criado com status pendente.',
      });
      setModalOpen(false);
      setForm({
        category_id: '',
        name: '',
        company_name: '',
        description: '',
        phone: '',
        cnpj: '',
        whatsapp: '',
        email: '',
        instagram: '',
        website: '',
        city: '',
        state: '',
        cover_image_url: '',
      });
      router.push(`/fornecedores/${created.id}`);
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Não foi possível criar o fornecedor.',
      });
    } finally {
      setSaving(false);
    }
  };

  const tableRows = items.map((supplier) => ({
    ...supplier,
    category_name: supplier.category_detail?.name || '-',
    location: [supplier.city, supplier.state].filter(Boolean).join(' • ') || '-',
  }));

  return (
    <BaseLayout title="Fornecedores">
      <Stack gap="lg" py="md">
        <Card radius="xl" p="xl" withBorder style={{ background: 'linear-gradient(135deg, #fffdf9 0%, #f6eee4 100%)' }}>
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Stack gap={4} style={{ maxWidth: 640 }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: 1.2 }}>
                Marketplace do casal
              </Text>
              <Title order={2}>Fornecedores do Marriplan</Title>
              <Text c="dimmed">
                Busque fornecedores aprovados, descubra novos parceiros e adicione ao casamento com poucos cliques.
              </Text>
            </Stack>
            <Button leftSection={<IconPlus size={18} />} styles={primaryButtonStyles} onClick={() => setModalOpen(true)}>
              Novo fornecedor
            </Button>
          </Group>
        </Card>

        <Card radius="xl" p="md" withBorder>
          <Stack gap="md">
            <Group grow align="flex-end" wrap="wrap">
              <TextInput
                label="Buscar"
                placeholder="Nome, empresa ou descrição"
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setPage(1);
                }}
                styles={inputStyles}
              />
              <Select
                label="Categoria"
                data={categoryOptions}
                value={category}
                onChange={(value) => {
                  setCategory(value || '');
                  setPage(1);
                }}
                styles={inputStyles}
              />
              <TextInput
                label="Cidade"
                placeholder="Ex.: São Paulo"
                value={city}
                onChange={(event) => {
                  setCity(event.currentTarget.value);
                  setPage(1);
                }}
                styles={inputStyles}
              />
              <TextInput
                label="Estado"
                placeholder="Ex.: SP"
                value={state}
                onChange={(event) => {
                  setState(event.currentTarget.value);
                  setPage(1);
                }}
                styles={inputStyles}
              />
            </Group>

            <Group justify="space-between" align="center" wrap="wrap">
              <Text size="sm" c="dimmed">
                {total} fornecedores encontrados
              </Text>
              <Group gap="xs">
                {VIEW_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={viewMode === option.value ? 'filled' : 'default'}
                    onClick={() => setViewMode(option.value as 'cards' | 'list')}
                    styles={viewMode === option.value ? primaryButtonStyles : softButtonStyles}
                  >
                    {option.label}
                  </Button>
                ))}
              </Group>
            </Group>
          </Stack>
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
              <Badge radius="xl" color="gray" variant="light">
                Nenhum resultado
              </Badge>
              <Title order={4}>Nada encontrado</Title>
              <Text c="dimmed" ta="center" maw={460}>
                Ajuste os filtros ou cadastre um novo fornecedor para começar a montar seu catálogo.
              </Text>
              <Button leftSection={<IconPlus size={18} />} onClick={() => setModalOpen(true)}>
                Cadastrar fornecedor
              </Button>
            </Stack>
          </Card>
        ) : viewMode === 'cards' ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {items.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onView={(item) => router.push(`/fornecedores/${item.id}`)}
                onAdd={(item) => router.push(`/fornecedores/${item.id}`)}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Card radius="xl" p="sm" withBorder>
            <DataTable
              records={tableRows}
              columns={[
                { accessor: 'name', title: 'Fornecedor' },
                { accessor: 'category_name', title: 'Categoria' },
                { accessor: 'location', title: 'Cidade/Estado' },
                {
                  accessor: 'status',
                  title: 'Status',
                  render: (record) => (
                    <Badge color={record.status === 'APPROVED' ? 'green' : 'yellow'} variant="light">
                      {record.status === 'APPROVED' ? 'Aprovado' : 'Pendente'}
                    </Badge>
                  ),
                },
                {
                  accessor: 'actions',
                  title: '',
                  render: (record) => (
                    <Button size="xs" variant="light" onClick={() => router.push(`/fornecedores/${record.id}`)}>
                      Abrir
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        )}

        {total > 12 ? (
          <Group justify="center">
            <Pagination value={page} onChange={setPage} total={Math.max(1, Math.ceil(total / 12))} />
          </Group>
        ) : null}
      </Stack>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Novo fornecedor" centered size="lg">
        <Stack gap="md">
          <Select
            label="Categoria"
            data={categoryFormOptions}
            value={form.category_id}
            onChange={(value) => setForm((prev) => ({ ...prev, category_id: value || '' }))}
            required
            styles={inputStyles}
          />
          <Group grow align="flex-start" wrap="wrap">
            <TextInput label="Nome" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.currentTarget.value }))} required styles={inputStyles} />
            <TextInput label="Empresa" value={form.company_name} onChange={(event) => setForm((prev) => ({ ...prev, company_name: event.currentTarget.value }))} styles={inputStyles} />
          </Group>
          <Textarea label="Descrição" minRows={3} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.currentTarget.value }))} styles={inputStyles} />
          <Group grow align="flex-start" wrap="wrap">
            <TextInput label="Telefone" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.currentTarget.value }))} styles={inputStyles} />
            <TextInput label="WhatsApp" value={form.whatsapp} onChange={(event) => setForm((prev) => ({ ...prev, whatsapp: event.currentTarget.value }))} styles={inputStyles} />
          </Group>
          <Group grow align="flex-start" wrap="wrap">
            <TextInput label="E-mail" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.currentTarget.value }))} styles={inputStyles} />
            <TextInput label="CNPJ" value={form.cnpj} onChange={(event) => setForm((prev) => ({ ...prev, cnpj: event.currentTarget.value }))} styles={inputStyles} />
          </Group>
          <Group grow align="flex-start" wrap="wrap">
            <TextInput label="Instagram" value={form.instagram} onChange={(event) => setForm((prev) => ({ ...prev, instagram: event.currentTarget.value }))} styles={inputStyles} />
            <TextInput label="Website" value={form.website} onChange={(event) => setForm((prev) => ({ ...prev, website: event.currentTarget.value }))} styles={inputStyles} />
          </Group>
          <Group grow align="flex-start" wrap="wrap">
            <TextInput label="Cidade" value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.currentTarget.value }))} styles={inputStyles} />
            <TextInput label="Estado" value={form.state} onChange={(event) => setForm((prev) => ({ ...prev, state: event.currentTarget.value }))} styles={inputStyles} />
          </Group>
          <TextInput label="Imagem de capa" placeholder="URL da imagem (opcional)" value={form.cover_image_url} onChange={(event) => setForm((prev) => ({ ...prev, cover_image_url: event.currentTarget.value }))} styles={inputStyles} />
          <Group justify="flex-end">
            <Button variant="default" styles={softButtonStyles} onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button loading={saving} styles={primaryButtonStyles} onClick={handleCreateSupplier}>
              Criar fornecedor
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseLayout>
  );
}
