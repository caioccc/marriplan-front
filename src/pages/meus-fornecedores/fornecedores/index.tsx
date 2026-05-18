import BaseLayout from "@/components/Layout/_BaseLayout";
import PageSectionHeader from "@/components/PageSectionHeader";
import { SupplierCard } from "@/components/SupplierCard";
import { SupplierFormModal } from "@/components/SupplierFormModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  listSupplierCategories,
  listSuppliers,
  selectSupplierForWedding,
  Supplier,
  SupplierCategory,
  updateWeddingSupplier,
  uploadSupplierContract,
} from "@/services/suppliers";
import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Loader,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconPaperclip,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

const VIEW_OPTIONS = [
  { value: "cards", label: "Cards" },
  { value: "list", label: "Lista" },
];

function formatCurrencyInput(value: string) {
  return value.replace(/[^\d,.-]/g, "").replace(",", ".");
}

const initialWeddingSupplierForm = {
  status: "QUOTING" as const,
  is_favorite: false,
  estimated_price: "",
  negotiated_price: "",
  paid_amount: "",
  notes: "",
};

export default function SuppliersMarketplacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const contractInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierModalMode, setSupplierModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [weddingForm, setWeddingForm] = useState(initialWeddingSupplierForm);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Todas as categorias" },
      ...categories.map((item) => ({ value: item.slug, label: item.name })),
    ],
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
            ordering: "-is_featured,name",
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

  const handleOpenCreateSupplier = () => {
    setEditingSupplier(null);
    setSupplierModalMode("create");
    setSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierModalMode("edit");
    setSupplierModalOpen(true);
  };

  const handleSavedSupplier = (savedSupplier: Supplier) => {
    if (supplierModalMode === "create") {
      router.push(`/meus-fornecedores/fornecedores/${savedSupplier.id}`);
      notifications.show({
        color: "green",
        message: "Fornecedor criado com sucesso!",
      });
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === savedSupplier.id ? { ...item, ...savedSupplier } : item,
      ),
    );
  };

  const handleOpenAddModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setWeddingForm(initialWeddingSupplierForm);
    setContractFile(null);
    setAddModalOpen(true);
  };

  const handleAddToWedding = async () => {
    if (!selectedSupplier) return;

    setAddingSupplier(true);
    try {
      let relation = await selectSupplierForWedding({
        supplier_id: selectedSupplier.id,
        status: weddingForm.status,
        is_favorite: weddingForm.is_favorite,
        estimated_price: formatCurrencyInput(weddingForm.estimated_price),
        negotiated_price: formatCurrencyInput(weddingForm.negotiated_price),
        paid_amount: formatCurrencyInput(weddingForm.paid_amount),
        notes: weddingForm.notes,
      });

      if (contractFile) {
        const uploaded = await uploadSupplierContract(contractFile);
        relation = await updateWeddingSupplier(relation.id, {
          contract_file_url: uploaded.url,
          contract_file_public_id: uploaded.public_id,
        });
      }

      notifications.show({
        color: "green",
        message: relation.contract_file_url
          ? "Fornecedor adicionado ao casamento com contrato anexado."
          : "Fornecedor adicionado ao casamento com sucesso.",
      });
      setAddModalOpen(false);
      router.push("/meus-fornecedores");
    } catch {
      notifications.show({
        color: "red",
        message: "Não foi possível adicionar este fornecedor ao seu casamento.",
      });
    } finally {
      setAddingSupplier(false);
    }
  };

  const tableRows = items.map((supplier) => ({
    ...supplier,
    category_name: supplier.category_detail?.name || "-",
    location:
      [supplier.city, supplier.state].filter(Boolean).join(" • ") || "-",
  }));

  return (
    <BaseLayout>
      <Stack gap="lg" py="md">
        <PageSectionHeader
          eyebrow="Marketplace do casal"
          title="Fornecedores do Marriplan"
          description="Busque fornecedores aprovados, descubra novos parceiros e adicione ao casamento com poucos cliques."
          actions={
            <Group gap="xs">
              <Button
                variant="default"
                styles={softButtonStyles}
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => router.back()}
              >
                Voltar
              </Button>
              <Button
                leftSection={<IconPlus size={18} />}
                styles={primaryButtonStyles}
                onClick={handleOpenCreateSupplier}
              >
                Novo fornecedor
              </Button>
            </Group>
          }
        />

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
                  setCategory(value || "");
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
                Ajuste os filtros ou cadastre um novo fornecedor para começar a
                montar seu catálogo.
              </Text>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={handleOpenCreateSupplier}
              >
                Cadastrar fornecedor
              </Button>
            </Stack>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="lg">
            {items.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onView={(item) =>
                  router.push(`/meus-fornecedores/fornecedores/${item.id}`)
                }
                onAdd={handleOpenAddModal}
                onEdit={handleOpenEditSupplier}
                canEdit={supplier.created_by_user === user?.id}
              />
            ))}
          </SimpleGrid>
        )}

        {total > 12 ? (
          <Group justify="center">
            <Pagination
              value={page}
              onChange={setPage}
              total={Math.max(1, Math.ceil(total / 12))}
            />
          </Group>
        ) : null}
      </Stack>

      <SupplierFormModal
        opened={supplierModalOpen}
        mode={supplierModalMode}
        supplier={editingSupplier}
        categories={categories}
        onClose={() => setSupplierModalOpen(false)}
        onSaved={handleSavedSupplier}
      />

      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={
          selectedSupplier
            ? `Adicionar ${selectedSupplier.name}`
            : "Adicionar fornecedor"
        }
        centered
        size="xl"
      >
        <Stack gap="md">
          <Group grow align="flex-start" wrap="wrap">
            <Select
              label="Status"
              data={[
                { value: "QUOTING", label: "Cotando" },
                { value: "NEGOTIATING", label: "Negociando" },
                { value: "HIRED", label: "Contratado" },
                { value: "PAID", label: "Pago" },
                { value: "CANCELED", label: "Cancelado" },
              ]}
              value={weddingForm.status}
              onChange={(value) =>
                setWeddingForm((prev) => ({
                  ...prev,
                  status: (value || "QUOTING") as typeof weddingForm.status,
                }))
              }
              styles={inputStyles}
            />
            <Checkbox
              mt={28}
              label="Favorito"
              checked={weddingForm.is_favorite}
              onChange={(event) =>
                setWeddingForm((prev) => ({
                  ...prev,
                  is_favorite: event.currentTarget.checked,
                }))
              }
            />
          </Group>

          <Group grow align="flex-start" wrap="wrap">
            <TextInput
              label="Valor estimado"
              value={weddingForm.estimated_price}
              onChange={(event) =>
                setWeddingForm((prev) => ({
                  ...prev,
                  estimated_price: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <TextInput
              label="Valor negociado"
              value={weddingForm.negotiated_price}
              onChange={(event) =>
                setWeddingForm((prev) => ({
                  ...prev,
                  negotiated_price: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
            <TextInput
              label="Valor pago"
              value={weddingForm.paid_amount}
              onChange={(event) =>
                setWeddingForm((prev) => ({
                  ...prev,
                  paid_amount: event.currentTarget.value,
                }))
              }
              styles={inputStyles}
            />
          </Group>

          <Textarea
            label="Observações"
            minRows={4}
            value={weddingForm.notes}
            onChange={(event) =>
              setWeddingForm((prev) => ({
                ...prev,
                notes: event.currentTarget.value,
              }))
            }
            styles={inputStyles}
          />

          <Card
            radius="lg"
            withBorder
            p="md"
            style={{ background: "rgba(246,238,228,0.45)" }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="wrap">
                <Group gap="xs">
                  <IconPaperclip size={16} />
                  <Text fw={600}>Contrato opcional</Text>
                </Group>
                <Button
                  variant="default"
                  onClick={() => contractInputRef.current?.click()}
                >
                  Escolher arquivo
                </Button>
              </Group>
              <input
                ref={contractInputRef}
                type="file"
                accept="application/pdf,image/*"
                style={{ display: "none" }}
                onChange={(event) =>
                  setContractFile(event.currentTarget.files?.[0] || null)
                }
              />
              <Text size="sm" c="dimmed">
                Envie PDF ou imagem para salvar junto com o fornecedor no seu
                casamento.
              </Text>
              {contractFile ? (
                <Badge color="blue" variant="light">
                  {contractFile.name}
                </Badge>
              ) : null}
            </Stack>
          </Card>

          <Group justify="flex-end">
            <Button
              variant="default"
              styles={softButtonStyles}
              onClick={() => setAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              loading={addingSupplier}
              styles={primaryButtonStyles}
              onClick={handleAddToWedding}
              disabled={addingSupplier || !selectedSupplier}
            >
              Adicionar ao casamento
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseLayout>
  );
}
