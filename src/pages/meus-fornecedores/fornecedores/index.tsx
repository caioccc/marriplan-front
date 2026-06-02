import { FreePlanLimitBanner } from "@/components/billing/FreePlanLimitBanner";
import BaseLayout from "@/components/Layout/_BaseLayout";
import PageSectionHeader from "@/components/PageSectionHeader";
import { SupplierCard } from "@/components/SupplierCard";
import { SupplierFormModal } from "@/components/SupplierFormModal";
import {
  FEATURE_LABELS,
  getFeatureLimit,
  isFeatureLimitReached,
} from "@/constants/plans";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import {
  listSupplierCategories,
  listSuppliers,
  listWeddingSuppliers,
  selectSupplierForWedding,
  Supplier,
  SupplierCategory,
} from "@/services/suppliers";
import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import {
  ActionIcon,
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
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconFilter,
  IconPaperclip,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

const paginationThemeStyles = `
  .supplier-pagination .mantine-Pagination-control {
    border-radius: 12px;
    border-color: var(--marriplan-border);
    color: var(--marriplan-text);
  }
  .supplier-pagination .mantine-Pagination-control[data-active] {
    background-color: var(--marriplan-rose);
    border-color: var(--marriplan-rose);
    color: #fff;
  }
`;

const initialWeddingSupplierForm = {
  status: "QUOTING" as const,
  is_favorite: false,
  valor_combinado: "",
  notes: "",
};

export default function SuppliersMarketplacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const contractInputRef = useRef<HTMLInputElement>(null);
  const [shuffleSeed] = useState(() => Math.random().toString(36).slice(2));
  const [items, setItems] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [weddingSupplierCount, setWeddingSupplierCount] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [draftCategory, setDraftCategory] = useState("");
  const [draftCity, setDraftCity] = useState("");
  const [draftState, setDraftState] = useState("");
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierModalMode, setSupplierModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmAddOpen, setConfirmAddOpen] = useState(false);
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [weddingForm, setWeddingForm] = useState(initialWeddingSupplierForm);
  const isCompactLayout = useMediaQuery("(max-width: 1024px)");
  const { isPremium } = useSubscription();

  const supplierLimit = getFeatureLimit("suppliers");
  const supplierLimitReached = isFeatureLimitReached(
    "suppliers",
    weddingSupplierCount,
    isPremium,
  );

  useEffect(() => {
    if (advancedFiltersOpen) {
      setDraftCategory(category);
      setDraftCity(city);
      setDraftState(state);
    }
  }, [advancedFiltersOpen, category, city, state]);

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
        const [supplierData, categoryData, weddingData] = await Promise.all([
          listSuppliers({
            page,
            page_size: 12,
            search,
            category,
            city,
            state,
            seed: shuffleSeed,
            ordering: "-is_featured,name",
          }),
          listSupplierCategories(),
          listWeddingSuppliers({ page_size: 1 }),
        ]);

        if (!mounted) return;

        setItems(supplierData.results || []);
        setTotal(supplierData.count || 0);
        setCategories(categoryData.results || categoryData || []);
        setWeddingSupplierCount(weddingData.count || 0);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [page, search, category, city, state, shuffleSeed]);

  useEffect(() => {
    window.scrollTo({
      top: 50,
      behavior: "smooth",
    });
  }, [page]);

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
    setConfirmAddOpen(true);
  };

  const handleAddToWedding = async () => {
    if (!selectedSupplier || supplierLimitReached) return;

    setAddingSupplier(true);
    try {
      await selectSupplierForWedding({
        supplier_id: selectedSupplier.id,
        status: "NEGOTIATING",
        is_favorite: false,
        valor_combinado: "0",
        notes: "",
      });

      notifications.show({
        color: "green",
        message: "Fornecedor adicionado ao casamento com sucesso.",
      });
      setConfirmAddOpen(false);
      router.push("/meus-fornecedores");
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        "Não foi possível adicionar este fornecedor ao seu casamento.";
      notifications.show({
        color: "red",
        message: errorMessage,
      });
    } finally {
      setAddingSupplier(false);
    }
  };

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
              {!supplierLimitReached ? (
                <Button
                  leftSection={<IconPlus size={18} />}
                  styles={primaryButtonStyles}
                  onClick={handleOpenCreateSupplier}
                >
                  Novo fornecedor
                </Button>
              ) : null}
            </Group>
          }
        />

        {supplierLimitReached ? (
          <FreePlanLimitBanner
            featureLabel={FEATURE_LABELS.suppliers}
            limit={typeof supplierLimit === "number" ? supplierLimit : 0}
            currentUsage={weddingSupplierCount}
            title="Você atingiu o limite do plano gratuito para fornecedores"
            description="No plano Free você pode manter até 3 fornecedores. Para cadastrar novos parceiros ou adicioná-los ao casamento, faça upgrade para o Premium."
          />
        ) : null}

        <Card radius="xl" p="md" withBorder>
          <Stack gap="md">
            <Group gap="sm" align="flex-end" wrap="nowrap">
              <TextInput
                label="Buscar"
                placeholder="Nome, empresa ou descrição"
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setPage(1);
                }}
                style={{ flex: 1, minWidth: 0 }}
                styles={inputStyles}
              />
              {isCompactLayout ? (
                <ActionIcon
                  aria-label="Abrir filtros avançados"
                  onClick={() => setAdvancedFiltersOpen(true)}
                  styles={{
                    root: {
                      backgroundColor: "var(--marriplan-rose)",
                      color: "#fff",
                      borderRadius: 12,
                      border: "1px solid var(--marriplan-rose)",
                    },
                  }}
                  size="lg"
                  variant="light"
                >
                  <IconFilter size={16} />
                </ActionIcon>
              ) : (
                <>
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
                </>
              )}
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
              {!supplierLimitReached ? (
                <Button
                  leftSection={<IconPlus size={18} />}
                  onClick={handleOpenCreateSupplier}
                >
                  Cadastrar fornecedor
                </Button>
              ) : null}
            </Stack>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {items.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onView={(item) =>
                  router.push(`/meus-fornecedores/fornecedores/${item.id}`)
                }
                onAdd={supplierLimitReached ? undefined : handleOpenAddModal}
                onEdit={handleOpenEditSupplier}
                canEdit={supplier.created_by_user === user?.id}
              />
            ))}
          </SimpleGrid>
        )}

        {total > 12 ? (
          <Group justify="center">
            <Pagination
              className="supplier-pagination"
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
        opened={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
        title="Filtros avançados"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Select
            label="Categoria"
            data={categoryOptions}
            value={draftCategory}
            onChange={(value) => setDraftCategory(value || "")}
            styles={inputStyles}
          />
          <TextInput
            label="Cidade"
            placeholder="Ex.: São Paulo"
            value={draftCity}
            onChange={(event) => setDraftCity(event.currentTarget.value)}
            styles={inputStyles}
          />
          <TextInput
            label="Estado"
            placeholder="Ex.: SP"
            value={draftState}
            onChange={(event) => setDraftState(event.currentTarget.value)}
            styles={inputStyles}
          />
          <Group justify="space-between" mt="sm">
            <Button
              variant="light"
              styles={softButtonStyles}
              onClick={() => {
                setDraftCategory("");
                setDraftCity("");
                setDraftState("");
                setCategory("");
                setCity("");
                setState("");
                setPage(1);
                setAdvancedFiltersOpen(false);
              }}
            >
              Limpar filtros
            </Button>
            <Button
              styles={primaryButtonStyles}
              onClick={() => {
                setCategory(draftCategory);
                setCity(draftCity);
                setState(draftState);
                setPage(1);
                setAdvancedFiltersOpen(false);
              }}
            >
              Aplicar
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={confirmAddOpen}
        onClose={() => setConfirmAddOpen(false)}
        title={
          selectedSupplier
            ? `Adicionar ${selectedSupplier.name} ao casamento?`
            : "Adicionar fornecedor"
        }
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text>
            Esta ação vai adicionar o fornecedor ao casamento com status
            <strong> Negociando</strong>.
          </Text>
          <Text size="sm" c="dimmed">
            Você poderá ajustar os detalhes do fornecedor no casamento depois.
          </Text>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button
              variant="default"
              styles={softButtonStyles}
              onClick={() => setConfirmAddOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              styles={primaryButtonStyles}
              onClick={handleAddToWedding}
              loading={addingSupplier}
              disabled={addingSupplier || supplierLimitReached}
            >
              Confirmar adição
            </Button>
          </div>
        </Stack>
      </Modal>

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
          {isCompactLayout ? (
            <Stack gap="md">
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
                label="Favorito"
                checked={weddingForm.is_favorite}
                onChange={(event) =>
                  setWeddingForm((prev) => ({
                    ...prev,
                    is_favorite: event.currentTarget.checked,
                  }))
                }
              />

              <TextInput
                label="Valor combinado"
                value={weddingForm.valor_combinado}
                onChange={(event) =>
                  setWeddingForm((prev) => ({
                    ...prev,
                    valor_combinado: event.currentTarget.value,
                  }))
                }
                styles={inputStyles}
              />

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
            </Stack>
          ) : (
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
                  label="Valor combinado"
                  value={weddingForm.valor_combinado}
                  onChange={(event) =>
                    setWeddingForm((prev) => ({
                      ...prev,
                      valor_combinado: event.currentTarget.value,
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
            </Stack>
          )}

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
              disabled={
                addingSupplier || !selectedSupplier || supplierLimitReached
              }
            >
              Adicionar ao casamento
            </Button>
          </Group>
        </Stack>
      </Modal>
      <style>{paginationThemeStyles}</style>
    </BaseLayout>
  );
}
